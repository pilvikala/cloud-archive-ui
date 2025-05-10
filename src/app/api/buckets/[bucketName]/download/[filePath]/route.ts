import { NextResponse, NextRequest } from 'next/server';
import { downloadFile } from '@/lib/gcpClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucketName: string; filePath: string }> }
) {
  const session = await getServerSession(authOptions);
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
    const fileStream = await downloadFile(bucketName, filePath);
    
    // Get the filename from the path
    const filename = filePath.split('/').pop() || filePath;
    
    // Create response with the file stream
    return new NextResponse(fileStream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`Error downloading file ${filePath} from bucket ${bucketName}:`, error);
    return NextResponse.json(
      { error: `Failed to download file ${filePath} from bucket ${bucketName}` },
      { status: 500 }
    );
  }
} 