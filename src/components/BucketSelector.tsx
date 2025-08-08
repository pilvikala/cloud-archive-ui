import { Button, Menu, MenuItem, CircularProgress, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState, useEffect } from 'react';

interface BucketSelectorProps {
  selectedBucket: string;
  onBucketSelect: (bucketName: string) => void;
  variant?: 'text' | 'contained' | 'outlined';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

export default function BucketSelector({ 
  selectedBucket, 
  onBucketSelect,
  variant = 'text',
  color = 'inherit'
}: BucketSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
        if(data.length > 0) {
          onBucketSelect(data[0]);
        }
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
    onBucketSelect(bucket);
    handleClose();
  };

  if (isLoading) {
    return <CircularProgress size={24} color={color} />;
  }

  if (error) {
    return <Typography color="error" variant="body2">{error}</Typography>;
  }

  return (
    <>
      <Button
        variant={variant}
        color={color}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        aria-controls={open ? 'bucket-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {selectedBucket || 'Select Bucket'}
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
  );
} 