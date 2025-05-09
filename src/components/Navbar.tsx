import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, CircularProgress } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface NavbarProps {
  onBucketSelect: (bucketName: string) => void;
}

export default function Navbar({ onBucketSelect }: NavbarProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBucket, setSelectedBucket] = useState('Select Bucket');
  const [buckets, setBuckets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await fetch('/api/buckets');
        if (!response.ok) {
          throw new Error('Failed to fetch buckets');
        }
        const data = await response.json();
        setBuckets(data);
        setError(null);
      } catch (err) {
        setError('Failed to load buckets');
        console.error('Error fetching buckets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuckets();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (bucket: string) => {
    setSelectedBucket(bucket);
    onBucketSelect(bucket);
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cloud Archive
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
                aria-controls={open ? 'bucket-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                {selectedBucket}
              </Button>
              <Menu
                id="bucket-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'bucket-button',
                }}
              >
                {buckets.map((bucketName) => (
                  <MenuItem 
                    key={bucketName} 
                    onClick={() => handleSelect(bucketName)}
                  >
                    {bucketName}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
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