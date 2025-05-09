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