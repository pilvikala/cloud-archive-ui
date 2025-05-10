This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This App shows a contents of a selected GCP Storage Bucket and allows you to download that. It is useful to share data in the bucket safely with your family. No database is needed, authentication is handled via Google credentials.

As a related project, check the local storage sync tool at https://github.com/pilvikala/cloud-archive.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Environment variables

Copy the `.env.example` to `.env` and fill in the variables. You will need to do the same on Vercel.

```
NEXTAUTH_URL=http://localhost:3000 # keep empty on Vercel
NEXTAUTH_SECRET= # Generate a secure random string using `openssl rand -base64 32`
GOOGLE_CLIENT_ID= # see below
GOOGLE_CLIENT_SECRET= # see below
ALLOWED_USERS="user@example.com;user2@example.com" # list of emails that are allowed to log in via Google.

# Service account key json
GOOGLE_SERVICE_ACCOUNT=' 
{
service account json
}
'
```

### To get the Google OAuth credentials:

1. Go to the Google Cloud Console
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials"
5. Create an OAuth 2.0 Client ID
6. Set the authorized redirect URI to: http://localhost:3000/api/auth/callback/google. When deployed to Vercel, add the additional redirect URIs to contain the Vercel URL (or your own domain).
7. Copy the Client ID and Client Secret to your .env file.

### How to get Service Account Key JSON

1. Go to the Google Cloud Console
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "Create Service Account"
4. Enter a name and description for the service account
5. Click "Create and Continue"
6. For the role, add:
   - "Storage Object Viewer" (for reading files)
   - "Storage Buckets Viewer" (for listing buckets)
7. Click "Done"
8. Find your new service account in the list and click on it
9. Go to the "Keys" tab
10. Click "Add Key" > "Create new key"
11. Choose "JSON" format
12. Click "Create"
13. The key file will automatically download
14. Open the downloaded JSON file and copy its contents into your .env file's GOOGLE_SERVICE_ACCOUNT variable. Enclose it in single quotes as shown in the example.

Note: Keep your service account key secure and never commit it to version control. If compromised, you can always delete the key and create a new one.
