'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isCognitoConfigured,
  cognitoSignIn,
  cognitoSignUp,
  cognitoConfirmSignUp,
  cognitoSignOut,
  cognitoGetSessionToken,
} from './cognito';

export interface User {
  id: string;
  email: string;
  name: string;
  college?: string;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, college?: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  isRealAuth: boolean;
}

const DEFAULT_MOCK_USER: User = {
  id: 'usr_student_demo_01',
  email: 'student@university.edu.in',
  name: 'Aarav Sharma',
  college: 'National Institute of Technology',
  currency: 'INR',
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_MOCK_USER,
  isAuthenticated: true,
  isLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  confirmSignUp: async () => {},
  signOut: async () => {},
  getAccessToken: async () => null,
  isRealAuth: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isRealAuth =
    process.env.NEXT_PUBLIC_USE_REAL_API === 'true' && isCognitoConfigured();

  const [user, setUser] = useState<User | null>(
    isRealAuth ? null : DEFAULT_MOCK_USER
  );
  const [isLoading, setIsLoading] = useState<boolean>(isRealAuth);

  const checkCurrentSession = useCallback(async () => {
    if (!isRealAuth) return;
    try {
      const token = await cognitoGetSessionToken();
      if (token) {
        setUser({
          id: 'cognito_user',
          email: 'student@university.edu.in',
          name: 'Student User',
          currency: 'INR',
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isRealAuth]);

  useEffect(() => {
    checkCurrentSession();
  }, [checkCurrentSession]);

  const signIn = async (email: string, password: string = 'SpendWise#2026') => {
    setIsLoading(true);
    try {
      if (isRealAuth) {
        await cognitoSignIn(email, password);
        await checkCurrentSession();
      } else {
        await new Promise((r) => setTimeout(r, 150));
        setUser({
          ...DEFAULT_MOCK_USER,
          email,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, college?: string) => {
    setIsLoading(true);
    try {
      if (isRealAuth) {
        await cognitoSignUp(email, password, name, college);
      } else {
        await new Promise((r) => setTimeout(r, 150));
        setUser({
          id: `usr_${Date.now()}`,
          email,
          name,
          college,
          currency: 'INR',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      if (isRealAuth) {
        await cognitoConfirmSignUp(email, code);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isRealAuth) {
        cognitoSignOut();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (isRealAuth) {
      return await cognitoGetSessionToken();
    }
    return 'mock-jwt-token-for-local-testing';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        getAccessToken,
        isRealAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
