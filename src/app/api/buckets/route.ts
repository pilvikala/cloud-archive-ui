import { NextResponse } from 'next/server';
import { listBuckets } from '@/lib/gcpClient';
import { auth } from '@/auth';
import allowedBuckets from '@/config/buckets';

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const buckets = await listBuckets();
    const filtered = allowedBuckets.length > 0
      ? buckets.filter(name => allowedBuckets.some(b => b.name === name))
      : buckets;
    const defaultBucket = allowedBuckets.find(b => b.default)?.name ?? null;
    return NextResponse.json({ buckets: filtered, defaultBucket });
  } catch (error) {
    console.error('Error listing buckets:', error);
    return NextResponse.json({ error: 'Failed to list buckets' }, { status: 500 });
  }
}
