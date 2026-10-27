# SpendWise — Frontend Client & AWS Integration

The SpendWise frontend is built with Next.js App Router, TypeScript, and Tailwind CSS. It communicates with Amazon API Gateway HTTP API and Amazon Cognito User Pools.

---

## 1. Environment Configuration

Create a `.env.local` file in `frontend/` based on `.env.example`:

```bash
# Set to 'true' to connect to live AWS API Gateway & Cognito User Pool
# Set to 'false' (or omit) to run locally with isolated student mock data
NEXT_PUBLIC_USE_REAL_API=false

# AWS API Gateway HTTP API Base URL (Obtained from SAM stack output 'ApiEndpoint')
NEXT_PUBLIC_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com/dev

# Amazon Cognito Configuration (Obtained from SAM stack outputs)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION=ap-south-1
```

---

## 2. Running Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 3. How Authentication & Authorization Works

1. **Sign-In Flow**:
   - The student enters their email and password on `/auth/login`.
   - `amazon-cognito-identity-js` authenticates directly against the Cognito User Pool via SRP (Secure Remote Password).
   - Upon successful authentication, Cognito returns a JWT access token and ID token.
2. **Authenticated API Calls**:
   - Every API request executed by `lib/api.ts` retrieves the fresh JWT access token via `cognitoGetSessionToken()` and attaches:
     ```http
     Authorization: Bearer <jwt-access-token>
     ```
3. **Backend Identity Enforcement**:
   - The API Gateway HTTP API Cognito JWT Authorizer verifies the token signature and issuer.
   - The Lambda function derives the user identity strictly from `event.requestContext.authorizer.jwt.claims.sub`.
   - Any client-submitted `userId` is ignored or rejected.

---

## 4. Cross-User Data Isolation Manual Test Plan

To verify that personal finance records are strictly isolated between students:

### Test Step 1: Student A Setup
1. Open the app in Browser 1 (or normal window) at [http://localhost:3000/auth/register](http://localhost:3000/auth/register).
2. Register **Student A** with email `student.a@university.edu.in`.
3. Confirm email with the verification code and sign in.
4. Go to `/transactions/new` and record an expense:
   - **Description**: `Hostel Mess Fees - Student A`
   - **Amount**: `₹4,500.00`
   - **Category**: `Food`
5. Go to `/budgets` and set an overall monthly budget of `₹12,000.00`.
6. Confirm that the dashboard reflects:
   - Total Spent: `₹4,500.00`
   - Remaining Budget: `₹7,500.00` (`₹12,000 - ₹4,500`)
   - Recent Transactions displays Student A's hostel mess fee.

### Test Step 2: Student B Isolation Verification
1. Open an **Incognito / Private Window** (or Browser 2) at [http://localhost:3000/auth/register](http://localhost:3000/auth/register).
2. Register **Student B** with email `student.b@university.edu.in`.
3. Confirm email and sign in as Student B.
4. Navigate to `/dashboard` and `/transactions`:
   - **Verification 1**: Total Spent is `₹0.00`.
   - **Verification 2**: Student B sees **zero** transactions from Student A.
   - **Verification 3**: Student B has no budgets configured.
5. Create a transaction for Student B:
   - **Description**: `Library Books - Student B`
   - **Amount**: `₹1,200.00`
   - **Category**: `Education`
6. Verify Student B's dashboard only displays `₹1,200.00` and does NOT include Student A's ₹4,500.00.

### Test Step 3: Direct API Penetration Check (Cross-User ID Tampering)
1. Using curl or Postman, capture Student B's JWT access token.
2. Attempt to fetch or delete Student A's transaction using Student B's token:
   ```bash
   curl -X GET "https://<api-url>/transactions/<student_A_transaction_id>" \
     -H "Authorization: Bearer <student_B_token>"
   ```
3. **Expected Result**: HTTP `404 Not Found`.
   - The backend query enforces `PK = USER#<student_B_sub>` in DynamoDB, meaning Student A's item is not found in Student B's partition.
   - The API never leaks whether the record ID exists under another user.
