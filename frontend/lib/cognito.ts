import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

let userPool: CognitoUserPool | null = null;

export function isCognitoConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
  );
}

function getUserPool(): CognitoUserPool {
  if (!userPool) {
    if (!isCognitoConfigured()) {
      throw new Error(
        'Amazon Cognito is not configured. Please set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID in your environment.'
      );
    }
    userPool = new CognitoUserPool(poolData);
  }
  return userPool;
}

/**
 * Register a new student user in Amazon Cognito User Pool
 */
export async function cognitoSignUp(
  email: string,
  password: string,
  name: string,
  college?: string
): Promise<{ userSub: string; userConfirmed: boolean }> {
  const pool = getUserPool();

  const attributeList: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
  ];

  if (name) {
    attributeList.push(new CognitoUserAttribute({ Name: 'name', Value: name }));
  }
  if (college) {
    attributeList.push(new CognitoUserAttribute({ Name: 'custom:college', Value: college }));
  }

  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (!result) {
        return reject(new Error('Sign up returned empty result'));
      }
      resolve({
        userSub: result.userSub,
        userConfirmed: result.userConfirmed,
      });
    });
  });
}

/**
 * Confirm user signup with email verification code
 */
export async function cognitoConfirmSignUp(email: string, code: string): Promise<string> {
  const pool = getUserPool();
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: pool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result || 'SUCCESS');
    });
  });
}

/**
 * Sign in user with email and password, returning CognitoUserSession
 */
export async function cognitoSignIn(
  email: string,
  password: string
): Promise<{ accessToken: string; idToken: string }> {
  const pool = getUserPool();
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: pool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve({
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
        });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Get the current user's valid JWT access token for API authorization
 */
export async function cognitoGetSessionToken(): Promise<string | null> {
  if (!isCognitoConfigured()) return null;

  try {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();
    if (!cognitoUser) return null;

    return new Promise((resolve) => {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
        } else {
          resolve(session.getAccessToken().getJwtToken());
        }
      });
    });
  } catch {
    return null;
  }
}

/**
 * Sign out from Cognito
 */
export function cognitoSignOut(): void {
  if (!isCognitoConfigured()) return;
  try {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  } catch {
    // Ignore cleanup error
  }
}
