const env = {
    appwrite: {
        endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
        projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        apikey: process.env.APPWRITE_API_KEY!,
    },
    resendApiKey: process.env.RESEND_API_KEY!,
};

export default env;