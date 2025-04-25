const env = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    apikey: process.env.APPWRITE_API_KEY!,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY!,
    from_email: process.env.SENDGRID_FROM_EMAIL!,
    public_url: process.env.NEXT_PUBLIC_APP_URL!,
  },
};

export default env;
