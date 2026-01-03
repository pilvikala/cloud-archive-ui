import { AppBar, Toolbar, Typography, Button, Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { signOut } from 'next-auth/react';
import BucketSelector from './BucketSelector';

interface NavbarProps {
  selectedBucket: string;
  onBucketSelect: (bucketName: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Navbar({ selectedBucket, onBucketSelect, searchQuery, onSearchChange }: NavbarProps) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cloud Archive
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedBucket && (
            <TextField
              placeholder="Search files and folders..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
                minWidth: 250,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
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