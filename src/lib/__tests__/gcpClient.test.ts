import { Storage } from '@google-cloud/storage';
import { listBuckets, listBucketContents, getSignedUrl } from '../gcpClient';

// Mock the @google-cloud/storage module
jest.mock('@google-cloud/storage');

describe('GCP Client', () => {
  let mockGetBuckets: jest.Mock;
  const mockServiceAccount = {
    type: 'service_account',
    project_id: 'test-project',
    private_key_id: 'test-key-id',
    private_key: 'test-private-key',
    client_email: 'test@test-project.iam.gserviceaccount.com',
    client_id: 'test-client-id',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test%40test-project.iam.gserviceaccount.com'
  };
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock implementation for getBuckets
    mockGetBuckets = jest.fn();
    (Storage as unknown as jest.Mock).mockImplementation(() => ({
      getBuckets: mockGetBuckets
    }));

    // Set mock environment variable
    process.env.GOOGLE_SERVICE_ACCOUNT = JSON.stringify(mockServiceAccount);
  });

  afterEach(() => {
    // Clean up environment variable
    delete process.env.GOOGLE_SERVICE_ACCOUNT;
  });

  describe('listBuckets', () => {
    it('should return list of bucket names', async () => {
      // Mock data
      const mockBuckets = [
        { name: 'bucket1' },
        { name: 'bucket2' },
        { name: 'bucket3' }
      ];
      
      // Setup mock response
      mockGetBuckets.mockResolvedValue([mockBuckets]);
      
      // Call the function
      const result = await listBuckets();
      
      // Verify results
      expect(result).toEqual(['bucket1', 'bucket2', 'bucket3']);
      expect(mockGetBuckets).toHaveBeenCalledTimes(1);
    });

    it('should throw error when GCP client fails', async () => {
      // Setup mock to throw error
      mockGetBuckets.mockRejectedValue(new Error('GCP API Error'));
      
      // Verify that the function throws
      await expect(listBuckets()).rejects.toThrow('Failed to list GCP buckets');
      expect(mockGetBuckets).toHaveBeenCalledTimes(1);
    });

    it('should throw error when service account is not set', async () => {
      // Remove environment variable
      delete process.env.GOOGLE_SERVICE_ACCOUNT;
      
      // Verify that the function throws
      await expect(listBuckets()).rejects.toThrow('GOOGLE_SERVICE_ACCOUNT environment variable is not set');
    });

    it('should throw error when service account JSON is invalid', async () => {
      // Set invalid JSON
      process.env.GOOGLE_SERVICE_ACCOUNT = 'invalid-json';
      
      // Verify that the function throws
      await expect(listBuckets()).rejects.toThrow('Invalid GOOGLE_SERVICE_ACCOUNT JSON format');
    });
  });

  describe('listBucketContents', () => {
    let mockGetFiles: jest.Mock;
    let mockBucket: jest.Mock;

    beforeEach(() => {
      // Setup mock implementation for bucket and getFiles
      mockGetFiles = jest.fn();
      mockBucket = jest.fn().mockReturnValue({
        getFiles: mockGetFiles
      });
      (Storage as unknown as jest.Mock).mockImplementation(() => ({
        bucket: mockBucket
      }));
    });

    it('should return list of files with names and sizes', async () => {
      // Mock data
      const mockFiles = [
        { name: 'file1.txt', metadata: { size: '1024' } },
        { name: 'folder/file2.txt', metadata: { size: '2048' } },
        { name: 'file3.txt', metadata: { size: '3072' } }
      ];
      
      // Setup mock response
      mockGetFiles.mockResolvedValue([mockFiles]);
      
      // Call the function
      const result = await listBucketContents('test-bucket');
      
      // Verify results
      expect(result).toEqual([
        { name: 'file1.txt', size: 1024 },
        { name: 'folder/file2.txt', size: 2048 },
        { name: 'file3.txt', size: 3072 }
      ]);
      expect(mockBucket).toHaveBeenCalledWith('test-bucket');
      expect(mockGetFiles).toHaveBeenCalledTimes(1);
    });

    it('should handle files with undefined size', async () => {
      // Mock data with undefined size
      const mockFiles = [
        { name: 'file1.txt', metadata: { size: undefined } },
        { name: 'file2.txt', metadata: {} }
      ];
      
      // Setup mock response
      mockGetFiles.mockResolvedValue([mockFiles]);
      
      // Call the function
      const result = await listBucketContents('test-bucket');
      
      // Verify results
      expect(result).toEqual([
        { name: 'file1.txt', size: 0 },
        { name: 'file2.txt', size: 0 }
      ]);
    });

    it('should throw error when GCP client fails', async () => {
      // Setup mock to throw error
      mockGetFiles.mockRejectedValue(new Error('GCP API Error'));
      
      // Verify that the function throws
      await expect(listBucketContents('test-bucket')).rejects.toThrow('Failed to list contents of bucket test-bucket');
      expect(mockBucket).toHaveBeenCalledWith('test-bucket');
      expect(mockGetFiles).toHaveBeenCalledTimes(1);
    });

    it('should throw error when service account is not set', async () => {
      // Remove environment variable
      delete process.env.GOOGLE_SERVICE_ACCOUNT;
      
      // Verify that the function throws
      await expect(listBucketContents('test-bucket')).rejects.toThrow('GOOGLE_SERVICE_ACCOUNT environment variable is not set');
    });

    it('should throw error when service account JSON is invalid', async () => {
      // Set invalid JSON
      process.env.GOOGLE_SERVICE_ACCOUNT = 'invalid-json';
      
      // Verify that the function throws
      await expect(listBucketContents('test-bucket')).rejects.toThrow('Invalid GOOGLE_SERVICE_ACCOUNT JSON format');
    });
  });

  describe('getSignedUrl', () => {
    let mockExists: jest.Mock;
    let mockGetSignedUrl: jest.Mock;
    let mockFile: jest.Mock;
    let mockBucket: jest.Mock;

    beforeEach(() => {
      // Setup mock implementation for bucket, file, exists, and getSignedUrl
      mockExists = jest.fn();
      mockGetSignedUrl = jest.fn();
      mockFile = jest.fn().mockReturnValue({
        exists: mockExists,
        getSignedUrl: mockGetSignedUrl
      });
      mockBucket = jest.fn().mockReturnValue({
        file: mockFile
      });
      (Storage as unknown as jest.Mock).mockImplementation(() => ({
        bucket: mockBucket
      }));
    });

    it('should return a signed URL for an existing file', async () => {
      // Mock data
      const mockUrl = 'https://storage.googleapis.com/test-bucket/test-file.txt?signature=xyz';
      
      // Setup mock responses
      mockExists.mockResolvedValue([true]);
      mockGetSignedUrl.mockResolvedValue([mockUrl]);
      
      // Call the function
      const result = await getSignedUrl('test-bucket', 'test-file.txt');
      
      // Verify results
      expect(result).toBe(mockUrl);
      expect(mockBucket).toHaveBeenCalledWith('test-bucket');
      expect(mockFile).toHaveBeenCalledWith('test-file.txt');
      expect(mockExists).toHaveBeenCalledTimes(1);
      expect(mockGetSignedUrl).toHaveBeenCalledWith({
        version: 'v4',
        action: 'read',
        expires: expect.any(Number)
      });
    });

    it('should throw error when file does not exist', async () => {
      // Setup mock to return false for exists
      mockExists.mockResolvedValue([false]);
      
      // Verify that the function throws
      await expect(getSignedUrl('test-bucket', 'nonexistent.txt'))
        .rejects
        .toThrow('Failed to generate signed URL for file nonexistent.txt from bucket test-bucket');
      expect(mockExists).toHaveBeenCalledTimes(1);
      expect(mockGetSignedUrl).not.toHaveBeenCalled();
    });

    it('should throw error when GCP client fails', async () => {
      // Setup mock to throw error
      mockExists.mockRejectedValue(new Error('GCP API Error'));
      
      // Verify that the function throws
      await expect(getSignedUrl('test-bucket', 'test-file.txt'))
        .rejects
        .toThrow('Failed to generate signed URL for file test-file.txt from bucket test-bucket');
      expect(mockExists).toHaveBeenCalledTimes(1);
      expect(mockGetSignedUrl).not.toHaveBeenCalled();
    });

    it('should throw error when service account is not set', async () => {
      // Remove environment variable
      delete process.env.GOOGLE_SERVICE_ACCOUNT;
      
      // Verify that the function throws
      await expect(getSignedUrl('test-bucket', 'test-file.txt'))
        .rejects
        .toThrow('GOOGLE_SERVICE_ACCOUNT environment variable is not set');
    });

    it('should throw error when service account JSON is invalid', async () => {
      // Set invalid JSON
      process.env.GOOGLE_SERVICE_ACCOUNT = 'invalid-json';
      
      // Verify that the function throws
      await expect(getSignedUrl('test-bucket', 'test-file.txt'))
        .rejects
        .toThrow('Invalid GOOGLE_SERVICE_ACCOUNT JSON format');
    });
  });
}); 