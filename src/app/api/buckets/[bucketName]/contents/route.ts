import { NextResponse, NextRequest } from 'next/server';
import { listBucketContents } from '@/lib/gcpClient';
import { auth } from '@/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bucketName: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bucketName = (await params).bucketName;

  if (!bucketName) {
    return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 });
  }

  try {
    const contents = await listBucketContents(bucketName);
    return NextResponse.json(contents);
  } catch (error) {
    console.error(`Error listing contents of bucket ${bucketName}:`, error);
    return NextResponse.json(
      { error: `Failed to list contents of bucket ${bucketName}` },
      { status: 500 }
    );
  }
}
