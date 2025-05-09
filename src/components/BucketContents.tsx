import { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, CircularProgress, Paper, Breadcrumbs, Link } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface FileItem {
  name: string;
  size: number;
}

interface FolderStructure {
  [key: string]: {
    files: FileItem[];
    subfolders: { [key: string]: any };
  };
}

interface BucketContentsProps {
  bucketName: string;
}

export default function BucketContents({ bucketName }: BucketContentsProps) {
  const [contents, setContents] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');

  useEffect(() => {
    const fetchContents = async () => {
      if (!bucketName) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/buckets/${bucketName}/contents`);
        if (!response.ok) {
          throw new Error('Failed to fetch bucket contents');
        }
        const data = await response.json();
        setContents(data);
      } catch (err) {
        setError('Failed to load bucket contents');
        console.error('Error fetching bucket contents:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, [bucketName]);

  const organizeByFolders = (files: FileItem[]): FolderStructure => {
    const structure: FolderStructure = {
      '': { files: [], subfolders: {} }
    };

    files.forEach(file => {
      const parts = file.name.split('/');
      const fileName = parts.pop() || '';
      let currentPath = '';
      let currentLevel = structure[''];

      // Process each part of the path
      parts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!currentLevel.subfolders[currentPath]) {
          currentLevel.subfolders[currentPath] = {
            files: [],
            subfolders: {}
          };
        }
        currentLevel = currentLevel.subfolders[currentPath];
      });

      // Add the file to the current level
      currentLevel.files.push({ name: fileName, size: file.size });
    });

    return structure;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getCurrentFolderContents = (structure: FolderStructure): { files: FileItem[], folders: string[] } => {
    if (!currentPath) {
      return {
        files: structure[''].files,
        folders: Object.keys(structure[''].subfolders)
      };
    }

    const parts = currentPath.split('/');
    let currentLevel = structure[''];
    
    for (const part of parts) {
      const path = parts.slice(0, parts.indexOf(part) + 1).join('/');
      currentLevel = currentLevel.subfolders[path];
      if (!currentLevel) break;
    }

    return {
      files: currentLevel?.files || [],
      folders: Object.keys(currentLevel?.subfolders || {})
    };
  };

  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleBreadcrumbClick = (index: number) => {
    const parts = currentPath.split('/');
    setCurrentPath(parts.slice(0, index).join('/'));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!bucketName) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Select a bucket to view its contents</Typography>
      </Box>
    );
  }

  const folderStructure = organizeByFolders(contents);
  const { files, folders } = getCurrentFolderContents(folderStructure);
  const pathParts = currentPath ? currentPath.split('/') : [];

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Contents of {bucketName}
      </Typography>
      
      {/* Breadcrumb navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="folder navigation"
        sx={{ mb: 2 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => setCurrentPath('')}
          sx={{ cursor: 'pointer' }}
        >
          Root
        </Link>
        {pathParts.map((part, index) => (
          <Link
            key={index}
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick(index + 1)}
            sx={{ cursor: 'pointer' }}
          >
            {part}
          </Link>
        ))}
      </Breadcrumbs>

      {/* Folders */}
      {folders.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Folders
          </Typography>
          <List>
            {folders.map((folder) => (
              <ListItem 
                key={folder}
                component="div"
                sx={{ 
                  pl: 2,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => handleFolderClick(folder)}
              >
                <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText primary={folder.split('/').pop()} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Files */}
      {files.length > 0 && (
        <Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Files
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem key={index} sx={{ pl: 2 }}>
                <InsertDriveFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText 
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {folders.length === 0 && files.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          This folder is empty
        </Typography>
      )}
    </Paper>
  );
} 