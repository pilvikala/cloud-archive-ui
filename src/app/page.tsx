"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import BucketContents from "@/components/BucketContents";
import { Container, Box } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const { status } = useSession();
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleBucketSelect = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setSearchQuery(''); // Clear search when bucket changes
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
  };

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
      <Navbar 
        selectedBucket={selectedBucket}
        onBucketSelect={handleBucketSelect}
        onSearchChange={handleSearchChange}
      />
      <Container component="main" sx={{ mt: 4, flex: 1 }}>
        <BucketContents 
          bucketName={selectedBucket}
          onBucketSelect={handleBucketSelect}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      </Container>
    </Box>
  );
}
