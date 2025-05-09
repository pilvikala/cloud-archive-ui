import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function Navbar() {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBucket, setSelectedBucket] = useState('Select Bucket');
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (bucket: string) => {
    setSelectedBucket(bucket);
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cloud Archive
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            <MenuItem onClick={() => handleSelect('bucket1')}>bucket1</MenuItem>
            <MenuItem onClick={() => handleSelect('bucket2')}>bucket2</MenuItem>
            <MenuItem onClick={() => handleSelect('bucket3')}>bucket3</MenuItem>
          </Menu>
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