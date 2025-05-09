"use client";

import { signIn } from "next-auth/react";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Welcome</h1>
        <button
          className={styles.googleButton}
          onClick={() => signIn("google", { 
            callbackUrl: "/",
            prompt: "select_account"
          })}
        >
          <img
            src="/google.svg"
            alt="Google logo"
            width={20}
            height={20}
            className={styles.googleIcon}
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
} 