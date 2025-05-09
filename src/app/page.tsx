"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.main}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1>Welcome, {session?.user?.name}!</h1>
        <p>You are signed in as {session?.user?.email}</p>
        <button
          className={styles.logoutButton}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
