import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { signOut } from 'next-auth/react';
import BucketSelector from './BucketSelector';

interface NavbarProps {
  selectedBucket: string;
  onBucketSelect: (bucketName: string) => void;
}

export default function Navbar({ selectedBucket, onBucketSelect }: NavbarProps) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cloud Archive
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BucketSelector 
            selectedBucket={selectedBucket}
            onBucketSelect={onBucketSelect}
          />
          <Button 
            color="inherit" 
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 