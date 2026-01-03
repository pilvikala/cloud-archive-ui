import { useState, useEffect, useMemo } from 'react';
import { Box, List, ListItem, ListItemText, Typography, CircularProgress, Paper, Breadcrumbs, Link, IconButton, Snackbar, Alert } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BucketSelector from './BucketSelector';

interface FileItem {
  name: string;
  size: number;
  fullPath?: string; // Optional full path for search results
}

interface FolderStructure {
  [key: string]: {
    files: FileItem[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subfolders: { [key: string]: any };
  };
}

interface BucketContentsProps {
  bucketName: string;
  onBucketSelect: (bucketName: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export default function BucketContents({ bucketName, onBucketSelect, searchQuery = '', onClearSearch }: BucketContentsProps) {
  const [contents, setContents] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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

  const getAllFolders = (structure: FolderStructure): string[] => {
    const folders: string[] = [];
    const root = structure[''];
    
    const traverse = (level: { files: FileItem[], subfolders: FolderStructure }) => {
      Object.keys(level.subfolders).forEach(folderPath => {
        folders.push(folderPath);
        traverse(level.subfolders[folderPath]);
      });
    };
    
    traverse(root);
    return folders;
  };

  const getCurrentFolderContents = (structure: FolderStructure): { files: FileItem[], folders: string[], isSearchMode: boolean } => {
    const hasSearchQuery = searchQuery.trim().length > 0;
    
    // If searching, search globally across all files and folders
    if (hasSearchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const allFiles: FileItem[] = [];
      const allFolders: string[] = [];
      
      // Search through all files - optimized with early exit for empty query
      if (query.length > 0) {
        contents.forEach(file => {
          if (file.name.toLowerCase().includes(query)) {
            allFiles.push({
              name: file.name.split('/').pop() || file.name,
              size: file.size,
              fullPath: file.name
            });
          }
        });
        
        // Search through all folders - calculate from structure
        const allFolderPaths = getAllFolders(structure);
        allFolderPaths.forEach(folderPath => {
          const folderName = folderPath.split('/').pop() || '';
          if (folderName.toLowerCase().includes(query) || folderPath.toLowerCase().includes(query)) {
            allFolders.push(folderPath);
          }
        });
      }
      
      return { 
        files: allFiles, 
        folders: allFolders,
        isSearchMode: true
      };
    }
    
    // Normal folder browsing mode
    let files: FileItem[] = [];
    let folders: string[] = [];

    if (!currentPath) {
      files = structure[''].files;
      folders = Object.keys(structure[''].subfolders);
    } else {
      const parts = currentPath.split('/');
      let currentLevel = structure[''];
      
      for (const part of parts) {
        const path = parts.slice(0, parts.indexOf(part) + 1).join('/');
        currentLevel = currentLevel.subfolders[path];
        if (!currentLevel) break;
      }

      files = currentLevel?.files || [];
      folders = Object.keys(currentLevel?.subfolders || {});
    }

    return { files, folders, isSearchMode: false };
  };

  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleBreadcrumbClick = (index: number) => {
    const parts = currentPath.split('/');
    setCurrentPath(parts.slice(0, index).join('/'));
  };

  // Memoize the folder structure to avoid recalculating on every render
  // Must be called before any early returns to follow React hooks rules
  const folderStructure = useMemo(() => organizeByFolders(contents), [contents]);
  
  // Memoize the current folder contents to avoid recalculating search on every render
  const { files, folders, isSearchMode } = useMemo(
    () => getCurrentFolderContents(folderStructure),
    [folderStructure, searchQuery, currentPath, contents]
  );
  
  const pathParts = currentPath ? currentPath.split('/') : [];

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
  
  // Get full paths for search results
  const getFileFullPath = (file: FileItem): string => {
    if (isSearchMode && file.fullPath) {
      return file.fullPath;
    }
    return currentPath ? `${currentPath}/${file.name}` : file.name;
  };
  
  const getFolderDisplayName = (folder: string): string => {
    return folder.split('/').pop() || folder;
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarMessage('Path copied to clipboard');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setSnackbarMessage('Failed to copy path');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {!bucketName ? (
          <>
            <BucketSelector
              selectedBucket={bucketName}
              onBucketSelect={onBucketSelect}
              variant="outlined"
              color="primary"
            />
          </>
        ) : (
          <Typography variant="h6">
            Contents of {bucketName}
          </Typography>
        )}
      </Box>
      
      {bucketName && (
        <>
          {/* Breadcrumb navigation - hide when searching */}
          {!isSearchMode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="folder navigation"
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
              {currentPath && (
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(currentPath)}
                  aria-label="copy path"
                  sx={{ ml: 1 }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
          
          {/* Search results header */}
          {isSearchMode && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              Search results for &quot;{searchQuery}&quot; ({files.length + folders.length} {files.length + folders.length === 1 ? 'result' : 'results'})
            </Typography>
          )}

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
                    onClick={() => {
                      // Clear search when navigating to a folder
                      if (isSearchMode) {
                        onClearSearch?.();
                      }
                      // Navigate to the folder
                      handleFolderClick(folder);
                    }}
                    secondaryAction={
                      isSearchMode ? (
                        <IconButton
                          edge="end"
                          aria-label="copy path"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(folder);
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      ) : undefined
                    }
                  >
                    <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <ListItemText 
                      primary={getFolderDisplayName(folder)}
                      secondary={isSearchMode ? folder : undefined}
                    />
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
                  <ListItem 
                    key={index} 
                    sx={{ 
                      pl: 2,
                      cursor: 'pointer',
                      '&:hover': { 
                        backgroundColor: 'action.hover'
                      }
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {isSearchMode && (
                          <IconButton
                            edge="end"
                            aria-label="copy path"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(getFileFullPath(file));
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton 
                          edge="end" 
                          aria-label="download"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const fullPath = getFileFullPath(file);
                            setDownloadingFiles(prev => new Set(prev).add(fullPath));
                            try {
                              const response = await fetch(`/api/buckets/${bucketName}/download/${encodeURIComponent(fullPath)}`);
                              if (!response.ok) {
                                throw new Error('Failed to get download URL');
                              }
                              const data = await response.json();
                              // Create a temporary link and trigger download
                              const link = document.createElement('a');
                              link.href = data.url;
                              link.download = data.filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (error) {
                              console.error('Error downloading file:', error);
                              // You might want to show an error message to the user here
                            } finally {
                              setDownloadingFiles(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(fullPath);
                                return newSet;
                              });
                            }
                          }}
                          disabled={downloadingFiles.has(getFileFullPath(file))}
                        >
                          {downloadingFiles.has(getFileFullPath(file)) ? (
                            <CircularProgress size={24} />
                          ) : (
                            <DownloadIcon />
                          )}
                        </IconButton>
                      </Box>
                    }
                    onClick={() => {
                      // When clicking a file in search mode, navigate to its folder and clear search
                      if (isSearchMode) {
                        const fullPath = getFileFullPath(file);
                        const pathParts = fullPath.split('/');
                        pathParts.pop(); // Remove filename
                        const folderPath = pathParts.join('/');
                        setCurrentPath(folderPath);
                        onClearSearch?.();
                      }
                    }}
                  >
                    <InsertDriveFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <ListItemText 
                      primary={file.name}
                      secondary={isSearchMode ? `${getFileFullPath(file)} • ${formatFileSize(file.size)}` : formatFileSize(file.size)}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {folders.length === 0 && files.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              {isSearchMode ? `No results found for "${searchQuery}"` : 'This folder is empty'}
            </Typography>
          )}
        </>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
} 