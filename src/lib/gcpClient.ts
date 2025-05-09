import { Storage } from '@google-cloud/storage';

/**
 * Lists all buckets in the GCP project
 * @returns Promise<string[]> Array of bucket names
 * @throws Error if GCP credentials are invalid or if there's an error listing buckets
 */
export async function listBuckets(): Promise<string[]> {
    // Get service account credentials from environment variable
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not set');
    }
    try {
        // Parse the service account JSON
        const credentials = JSON.parse(serviceAccountJson);

        // Initialize the GCP Storage client with explicit credentials
        const storage = new Storage({
            credentials,
            projectId: credentials.project_id
        });

        // List all buckets in the project
        const [buckets] = await storage.getBuckets();

        // Return just the bucket names
        return buckets.map(bucket => bucket.name);
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT JSON format');
        }
        console.error('Error listing GCP buckets:', error);
        throw new Error('Failed to list GCP buckets');
    }
}

/**
 * Lists all files in a GCP bucket with their paths and sizes
 * @param bucketName Name of the bucket to list contents from
 * @returns Promise<Array<{name: string, size: number}>> Array of objects containing file names and sizes
 * @throws Error if GCP credentials are invalid or if there's an error listing bucket contents
 */
export async function listBucketContents(bucketName: string): Promise<Array<{name: string, size: number}>> {
    // Get service account credentials from environment variable
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not set');
    }
    try {
        // Parse the service account JSON
        const credentials = JSON.parse(serviceAccountJson);

        // Initialize the GCP Storage client with explicit credentials
        const storage = new Storage({
            credentials,
            projectId: credentials.project_id
        });

        // Get the bucket
        const bucket = storage.bucket(bucketName);

        // List all files in the bucket
        const [files] = await bucket.getFiles();

        // Return array of file names and sizes
        return files.map(file => ({
            name: file.name,
            size: Number(file.metadata.size) || 0
        }));
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT JSON format');
        }
        console.error('Error listing bucket contents:', error);
        throw new Error(`Failed to list contents of bucket ${bucketName}`);
    }
} 