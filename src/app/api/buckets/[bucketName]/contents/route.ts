import { NextResponse } from 'next/server';
import { listBucketContents } from '@/lib/gcpClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { bucketName: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bucketName } = params;

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