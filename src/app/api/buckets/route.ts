import { NextResponse } from 'next/server';
import { listBuckets } from '@/lib/gcpClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const buckets = await listBuckets();
    return NextResponse.json(buckets);
  } catch (error) {
    console.error('Error listing buckets:', error);
    return NextResponse.json({ error: 'Failed to list buckets' }, { status: 500 });
  }
} 