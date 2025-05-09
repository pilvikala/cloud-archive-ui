import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cloud Archive
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            {session?.user?.name}
          </Typography>
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