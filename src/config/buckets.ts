export interface BucketConfig {
  name: string;
  default?: boolean;
}

// List of buckets to display. If empty, all buckets are shown.
const buckets: BucketConfig[] = [
   { name: 'pilvikala-archive', default: true },
];

export default buckets;
