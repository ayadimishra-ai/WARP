"use client";

import { signUp, useSession, signOut, signIn } from "@/lib/auth-client";
import React, { useState, useCallback } from "react";
import { getUsers } from "./actions";
import { GetUserDetailsQuery } from "@/graphql/server/generated";

interface UserData {
  id: string;
  email: string;
  name: string;
  image?: string;
}

const TestPage = () => {
  const session = useSession();
  const [data, setData] = useState<GetUserDetailsQuery>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.email({
        email: "test@test.com",
        password: "password",
        name: "test",
        image: "https://picsum.photos/200/300",
      });
      console.log({ result });
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.email({
        email: "test@test.com",
        password: "password",
      });
    } catch (err) {
      console.error('Sign in failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, []);

  const getUsersData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const users = await getUsers();
      setData(users || []);
    } catch (err) {
      console.error('Failed to get users:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (session.isPending) {
    return <div>Loading session...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (session.data) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Welcome {session.data.user?.name || 'User'}</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            style={{ marginRight: '10px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
          <button
            onClick={getUsersData}
            disabled={isLoading}
            style={{ cursor: 'pointer' }}
          >
            Get Users
          </button>
        </div>
        {data?.Tbl_Users?.length && (
          <div style={{ marginTop: '20px' }}>
            <h3>Users:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          style={{ marginRight: '10px', cursor: 'pointer' }}
        >
          Sign In
        </button>
        <button
          onClick={handleSignup}
          disabled={isLoading}
          style={{ cursor: 'pointer' }}
        >
          Sign Up
        </button>
      </div>
      <div>
        <button
          onClick={getUsersData}
          disabled={isLoading}
          style={{ cursor: 'pointer' }}
        >
          Get Users
        </button>
        {data?.Tbl_Users?.length && (
          <div style={{ marginTop: '20px' }}>
            <h3>Users:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
