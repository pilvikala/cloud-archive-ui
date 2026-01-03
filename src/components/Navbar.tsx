import { AppBar, Toolbar, Typography, Button, Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { signOut } from 'next-auth/react';
import BucketSelector from './BucketSelector';
import { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  selectedBucket: string;
  onBucketSelect: (bucketName: string) => void;
  onSearchChange: (query: string) => Promise<void>;
  searchQuery?: string; // Add searchQuery prop to sync with parent
}

export default function Navbar({ selectedBucket, onBucketSelect, onSearchChange, searchQuery = '' }: NavbarProps) {
  const [localSearchValue, setLocalSearchValue] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentValueRef = useRef<string>('');

  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer to debounce the search
    debounceTimerRef.current = setTimeout(() => {
      lastSentValueRef.current = localSearchValue;
      onSearchChange(localSearchValue);
    }, 300); // 300ms debounce delay

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearchValue, onSearchChange]);

  // Sync local search value with parent's searchQuery when it's cleared externally
  // Only sync when searchQuery becomes empty from a non-empty value (external clear)
  useEffect(() => {
    // Only sync when parent explicitly clears (searchQuery is empty but we have a local value)
    // AND we had previously sent a non-empty value (meaning it was cleared externally, not by user)
    if (searchQuery === '' && lastSentValueRef.current !== '' && localSearchValue !== '') {
      setLocalSearchValue('');
      lastSentValueRef.current = '';
      // Clear any pending debounced calls
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    }
    // Also update lastSentValueRef when searchQuery changes from parent (after debounce)
    else if (searchQuery !== '' && searchQuery === localSearchValue) {
      lastSentValueRef.current = searchQuery;
    }
  }, [searchQuery, localSearchValue]);

  // Clear search when bucket changes
  useEffect(() => {
    setLocalSearchValue('');
  }, [selectedBucket]);

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
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
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