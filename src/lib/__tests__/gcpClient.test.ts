import { Storage } from '@google-cloud/storage';
import { listBuckets, listBucketContents } from '../gcpClient';

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
}); 