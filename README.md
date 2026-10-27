# SpendWise — Student Expense Tracker

> A personal finance web application built for the **Cybernetics Software Pvt. Ltd. Junior Software Developer Assessment**.

SpendWise empowers university students to track allowances and campus expenditures, set monthly and category-specific budget limits with early threshold warnings (75%, 90%, 100%), evaluate planned purchases before buying with a **“Can I Afford This?”** calculator, and analyze spending patterns without connecting to real bank accounts.

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (AWS Amplify Hosting)"]
        UI["Next.js App Router (TypeScript + Tailwind CSS)"]
        AuthUI["Cognito Auth Provider (SRP Flow)"]
        ApiClient["Typed API Client (lib/api.ts)"]
    end

    subgraph Security["Identity & Access"]
        Cognito["Amazon Cognito User Pool\n(JWT Claims Verification)"]
    end

    subgraph API["API Gateway Layer"]
        HttpApi["Amazon API Gateway HTTP API (v2)\n(CORS + JWT Authorizer)"]
    end

    subgraph Compute["Serverless Compute"]
        Lambda["AWS Lambda Function\n(Node.js 22 ES Modules)"]
    end

    subgraph Storage["Data & Object Persistence"]
        DynamoDB[("Amazon DynamoDB\n(Single-Table Design + GSI1)")]
        S3["Amazon S3 Receipts Bucket\n(Private + Presigned URLs)")]
    end

    UI --> AuthUI
    AuthUI -->|Authenticate / SRP| Cognito
    Cognito -->|Return JWT Access Token| AuthUI
    UI --> ApiClient
    ApiClient -->|HTTPS + Bearer JWT Token| HttpApi
    HttpApi -->|Validate JWT Claims| Cognito
    HttpApi -->|Route Event with Claims| Lambda
    Lambda -->|Derive userId from sub claim| DynamoDB
    Lambda -->|Generate Presigned Upload URL| S3
```

---

## 2. Mandatory Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | **Next.js 16 (App Router)** | TypeScript, Tailwind CSS, Lucide React, Partial Prerendering |
| **Hosting** | **AWS Amplify Hosting** | Continuous Git integration with automated build pipeline (`amplify.yml`) |
| **API Gateway** | **Amazon API Gateway HTTP API (v2)** | Built-in CORS, high performance, low cost, native JWT authorizer |
| **Compute** | **AWS Lambda** | Node.js 22 runtime using JavaScript ES modules (`.mjs`) |
| **Database** | **Amazon DynamoDB** | Single-table design, Pay-Per-Request (On-Demand), GSI1 for date queries |
| **Storage** | **Amazon S3** | Private receipt storage with public access completely blocked |
| **Authentication** | **Amazon Cognito User Pools** | Web Client (no secret), SRP secure authentication, JWT token authorization |
| **Infrastructure** | **AWS SAM / CloudFormation** | Infrastructure as Code in `backend/template.yaml` |
| **Compute Exclusion** | **Zero EC2** | 100% serverless; no virtual servers created or required |

---

## 3. Core Features

1. **Dashboard Overview**: Summary cards displaying Total Income, Total Expenses, Budget Remaining (`Overall Limit - Expenses`), and Net Cash Flow.
2. **Transaction Management**: Record, list, view, edit, and delete transactions with description, amount, type (Income/Expense), category, ISO date, payment method, and optional notes.
3. **9 Student Categories**: `Food`, `Travel`, `Shopping`, `Education`, `Entertainment`, `Bills`, `Health`, `Income`, and `Other`.
4. **Search & Multi-Criteria Filtering**: Filter by keyword search, date range, category dropdown, and type toggles.
5. **Monthly & Category Budgets**: Set an overall monthly spending ceiling, plus optional category limits (e.g. Food: ₹5,000, Travel: ₹2,000).
6. **Early Warning Threshold Alerts**: Automatic status updates and warning badges at **75%** (Caution), **90%** (Warning), and **100%** (Exceeded).
7. **“Can I Afford This?” Calculator**: Students enter a planned purchase amount; evaluates projected remaining budget and warns before buying.
8. **Indian Rupee (₹) Formatting**: Consistent `Intl.NumberFormat('en-IN')` formatting across all screens.
9. **Month-over-Month Comparison**: Compares current month spending against the previous calendar month with delta amounts and percentages.
10. **Dual-Mode Flexibility**: Runs in offline/mock mode for fast local evaluation, and connects to live AWS Cloud infrastructure via environment variables.

---

## 4. Security & Data Integrity

- **Server-Derived Identity**: The backend derives the caller's identity strictly from `event.requestContext.authorizer.jwt.claims.sub`.
- **Zero Client Spoofing**: Client-submitted `userId` in JSON bodies or query strings is strictly rejected or ignored.
- **Partition Isolation**: Every DynamoDB query enforces `PK = USER#<sub-id>`. User A cannot read, mutate, or delete User B's records.
- **Error Sanitization**: API errors return sanitized JSON with a unique `requestId`; database connection details and stack traces are never exposed.
- **Private S3 Storage**: All public access is blocked at the bucket level; short-lived (5-minute) presigned URLs are scoped to `receipts/${userId}/...`.
- **Credential Hygiene**: Zero secrets or private keys are committed; `.gitignore` excludes all `.env*` except `.env.example`.

---

## 5. Repository Structure

```text
spendwise/
├── amplify.yml                     # AWS Amplify Hosting build specification
├── package.json                    # Monorepo root script runner
├── qa_report.md                    # Independent QA and Security review report
├── README.md                       # Master assessment documentation
├── .env.example                    # Environment variable template
├── .gitignore                      # Git exclusion rules
│
├── frontend/                       # Next.js App Router Client
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── dashboard/page.tsx      # Main student financial dashboard
│   │   ├── transactions/           # Transaction listing & table
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx        # Create transaction
│   │   │   └── [id]/edit/page.tsx  # Edit transaction
│   │   ├── budgets/page.tsx        # Budget limits & progress
│   │   ├── analytics/page.tsx      # Category breakdown & MoM charts
│   │   ├── settings/page.tsx       # Student profile & currency
│   │   └── auth/                   # Cognito login & registration
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   ├── components/
│   │   ├── layout/                 # AppShell, Sidebar, Header, MobileNav
│   │   ├── dashboard/              # SummaryCards, BudgetProgress, AffordabilityCalculator
│   │   ├── transactions/           # TransactionTable, TransactionFilters, TransactionForm
│   │   ├── budgets/                # BudgetModal
│   │   └── ui/                     # Card, Button, Badge, FormField, Modal, States
│   ├── lib/
│   │   ├── api.ts                  # Typed API Client (dual-mode)
│   │   ├── auth.tsx                # AuthProvider with Cognito session hooks
│   │   ├── cognito.ts              # AWS Cognito User Pools integration
│   │   ├── currency.ts             # INR formatting & calculation helpers
│   │   └── mockData.ts             # Centralized student seed dataset
│   └── types/index.ts              # TypeScript domain models
│
├── backend/                        # AWS Serverless Backend
│   ├── template.yaml               # AWS SAM CloudFormation template
│   ├── package.json                # Node.js 22 ES modules dependencies
│   ├── README.md                   # Backend deployment & API guide
│   ├── src/
│   │   ├── index.mjs               # Main Lambda router
│   │   ├── handlers/               # health, transactions, budgets, analytics, uploads
│   │   └── helpers/                # auth, db, response, validation, s3
│   └── tests/                      # Backend unit tests
│
└── tests/                          # Root QA & Security Automated Test Suites
    ├── financial-calculations.test.mjs
    ├── input-validation.test.mjs
    └── security-audit.test.mjs
```

---

## 6. Environment Variables

Only public parameters are used on the frontend. No AWS IAM secrets or private keys are ever stored in browser code.

| Variable | Scope | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_USE_REAL_API` | Frontend | Toggle between live AWS and local mock mode | `false` (local) or `true` (cloud) |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | AWS API Gateway HTTP API base endpoint | `https://<api-id>.execute-api.ap-south-1.amazonaws.com/dev` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Frontend | Amazon Cognito User Pool ID | `ap-south-1_xxxxxxxxx` |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Frontend | Amazon Cognito App Client ID (Public web client) | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_COGNITO_REGION` | Frontend | AWS Region where Cognito is deployed | `ap-south-1` |
| `TABLE_NAME` | Backend | DynamoDB table name injected by SAM | `${AWS::StackName}-table` |
| `RECEIPTS_BUCKET` | Backend | Private S3 bucket name injected by SAM | `${AWS::StackName}-receipts-${AWS::AccountId}` |
| `ALLOWED_ORIGIN` | Backend | CORS Allowed Origin | `http://localhost:3000` (dev) or Amplify domain |

---

## 7. Local Setup & Testing

### Prerequisites
- **Node.js**: v20 or v22+ (`node -v`)
- **npm**: v10+ (`npm -v`)
- **Git**: (`git --version`)

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd spendwise

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### Step 2: Run Automated Tests
Execute all 63 unit and regression test suites across calculations, validation, security, and handlers:
```bash
npm test
```
*Expected Result: 63 tests pass across 15 suites (0 failures).*

### Step 3: Run Frontend Locally
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application runs immediately with complete student mock data.

---

## 8. AWS Cloud Deployment Guide

Follow these ordered, beginner-friendly instructions to deploy the application to AWS.

### Step 1: Deploy Backend via AWS SAM

1. **Verify AWS CLI Identity**:
   ```bash
   aws sts get-caller-identity
   ```
   *Confirms your AWS Account ID and active IAM credentials.*

2. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

3. **Build Serverless Artifacts**:
   ```bash
   sam build
   ```

4. **Deploy Guided**:
   ```bash
   sam deploy --guided
   ```
   Enter the guided prompts:
   - **Stack Name**: `spendwise-backend`
   - **AWS Region**: `ap-south-1` (Mumbai) or your preferred region (e.g. `us-east-1`)
   - **Parameter Stage**: `dev`
   - **Parameter AllowedOrigin**: `*` (or `http://localhost:3000` for development)
   - **Confirm changes before deploy**: `y`
   - **Allow SAM CLI IAM role creation**: `y`
   - **Disable rollback**: `n`
   - **Save arguments to configuration file**: `y`

5. **Capture Stack Outputs**:
   After deployment finishes, copy the outputs from the terminal:
   - `ApiEndpoint` -> `https://<api-id>.execute-api.<region>.amazonaws.com/dev`
   - `CognitoUserPoolId` -> `ap-south-1_xxxxxxxxx`
   - `CognitoUserPoolClientId` -> `xxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 2: Deploy Frontend via AWS Amplify Hosting

1. Push your SpendWise repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete SpendWise full-stack application"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Open the [AWS Amplify Console](https://console.aws.amazon.com/amplify/):
   - Click **Deploy an app** -> Select **GitHub**.
   - Authorize AWS Amplify and select your `spendwise` repository and `main` branch.

3. **Build Settings**:
   - Amplify automatically detects `amplify.yml` at the repository root.

4. **Configure Environment Variables** in the Amplify Console:
   Under **App settings** -> **Environment variables**, add:
   - `NEXT_PUBLIC_USE_REAL_API` = `true`
   - `NEXT_PUBLIC_API_BASE_URL` = *(Your `ApiEndpoint` output from SAM)*
   - `NEXT_PUBLIC_COGNITO_USER_POOL_ID` = *(Your `CognitoUserPoolId` output)*
   - `NEXT_PUBLIC_COGNITO_CLIENT_ID` = *(Your `CognitoUserPoolClientId` output)*
   - `NEXT_PUBLIC_COGNITO_REGION` = *(Your AWS Region, e.g. `ap-south-1`)*

5. Click **Save and deploy**. Amplify will build and host your Next.js application with a secure public HTTPS URL (e.g. `https://main.d123456789.amplifyapp.com`).

6. **Update Backend CORS (Final Security Polish)**:
   Update the SAM parameter `AllowedOrigin` to your real Amplify URL:
   ```bash
   sam deploy --parameter-overrides AllowedOrigin=https://main.d123456789.amplifyapp.com
   ```

---

## 9. Cost Awareness & Cleanup

All deployed AWS services utilize **Serverless Free-Tier / Pay-Per-Request** billing:
- **API Gateway HTTP API**: Free tier includes 1,000,000 calls/month.
- **AWS Lambda**: Free tier includes 1,000,000 requests and 3,200,000 compute seconds/month.
- **Amazon DynamoDB**: Free tier includes 25 GB of storage and 25 RCU/WCU.
- **Amazon Cognito**: Free tier includes 50,000 monthly active users.
- **Amazon S3**: Free tier includes 5 GB of standard storage.
- **Zero EC2 Instances**: No idle hourly server charges.

### Clean Up Resources
When testing is complete and you wish to delete all cloud resources to avoid any future charges:
```bash
# Delete all backend resources (Lambda, API Gateway, DynamoDB, Cognito, S3)
sam delete --stack-name spendwise-backend
```
In the AWS Amplify Console, select your app and choose **Delete app**.
