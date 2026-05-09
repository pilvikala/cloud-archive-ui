import { NextResponse, NextRequest } from 'next/server';
import { getSignedUrl } from '@/lib/gcpClient';
import { auth } from '@/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bucketName: string; filePath: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bucketName, filePath } = await params;

  if (!bucketName || !filePath) {
    return NextResponse.json(
      { error: 'Bucket name and file path are required' },
      { status: 400 }
    );
  }

  try {
    const signedUrl = await getSignedUrl(bucketName, filePath);
    const filename = filePath.split('/').pop() || filePath;
    return NextResponse.json({ url: signedUrl, filename });
  } catch (error) {
    console.error(`Error generating signed URL for file ${filePath} from bucket ${bucketName}:`, error);
    return NextResponse.json(
      { error: `Failed to generate download URL for file ${filePath} from bucket ${bucketName}` },
      { status: 500 }
    );
  }
}
