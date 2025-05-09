"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import { Container, Box } from "@mui/material";

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ mt: 4, flex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <h1>Welcome, {session?.user?.name}!</h1>
          <p>You are signed in as {session?.user?.email}</p>
        </Box>
      </Container>
    </Box>
  );
}
