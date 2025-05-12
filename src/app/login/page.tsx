"use client";

import { signIn } from "next-auth/react";
import styles from "./login.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div style={{ visibility: 'hidden' }}>
            <button className={styles.googleButton}>
              <Image
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
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <button
          className={styles.googleButton}
          onClick={() => signIn("google", { 
            callbackUrl: "/",
            prompt: "select_account"
          })}
        >
          <Image
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