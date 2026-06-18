"use client";

import { signUp, useSession, getSession } from "@/lib/auth-client";
import React, { useEffect } from "react";

const Signup = () => {
  const session = useSession();
  console.log({ session });

  const handleSignup = async () => {
    await signUp.email({
      email: "test@test.com",
      password: "password",
      name: "test",
      image: "https://picsum.photos/200/300"
    });
  };

  useEffect(() => {
    getSession({
      fetchOptions: {
        onSuccess: (ctx) => {
          const jwt = ctx.response.headers.get("set-auth-jwt");
          console.log("jwt: ", jwt);
        }
      }
    });
  }, [getSession]);

  return (
    <div>
      <div>signup</div>
      <div>
        <button style={{ cursor: "pointer" }} onClick={handleSignup}>
          Signup
        </button>
      </div>
    </div>
  );
};

export default Signup;
