# PROCOG Risk Indicator Platform

PROCOG is a risk indicator platform for organizations seeking to proactively identify, assess, and manage potential threats and opportunities. Built with Next.js, Appwrite, and various other modern technologies, this advanced system empowers teams to collaboratively track risk indicators, analyze potential impacts, and implement effective mitigation strategies before risks materialize.

**Visit the live website:** [https://procog-test.vercel.app](https://procog-test.vercel.app)

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Getting Started](#getting-started)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)

## Features

- **Risk Management**: Create, track, and resolve risks with detailed information
- **Risk Analysis**: AI-powered analysis for better risk assessment
- **Collaboration Tools**: Comments, voting, and notifications for team collaboration
- **Document Management**: Attachment support for relevant documents
- **User Administration**: User and department management with role-based access control
- **Rate Limiting**: Protection against abuse and spam
- **Email Notifications**: Automated notifications for various events

## Technologies

- **Frontend**: Next.js, React, TailwindCSS, Radix UI components
- **Backend**: Next.js API routes, Node.js
- **Database**: Appwrite
- **Storage**: Appwrite Storage
- **Authentication**: Appwrite Authentication
- **API Rate Limiting**: Upstash Redis
- **Email Service**: SendGrid
- **AI Integration**: Google Gemini API

## Prerequisites

Before you can run this project, you need to register for and set up the following services:

1. **Appwrite Account**

   - Sign up at [cloud.appwrite.io](https://cloud.appwrite.io)
   - Create a new project
   - Create a new API key with all necessary permissions
   - Create a new database

2. **SendGrid Account** (for email notifications)

   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Create an API key
   - Verify a sender email address

3. **Upstash Redis** (for rate limiting)

   - Sign up at [upstash.com](https://upstash.com)
   - Create a new Redis database
   - Get your REST URL and token

4. **Google Gemini API** (for AI-powered risk analysis)
   - Sign up at [ai.google.dev](https://ai.google.dev)
   - Create an API key

## Environment Setup

1. Clone this repository
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in the required environment variables in `.env.local`:

```
APPWRITE_API_KEY="YOUR_APPWRITE_API_KEY"
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://<region>.cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="YOUR_APPWRITE_PROJECT_ID"
NEXT_PUBLIC_APPWRITE_DATABASE_ID="YOUR_APPWRITE_DATABASE_ID"
GEMINI_API_KEY="your-gemini-api-key"
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="your-sendgrid-from-email"
UPSTASH_REDIS_REST_URL="your-upstash-redis-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"
```

## Installation

Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

## Database Setup

Run the database setup script to create all required collections and attributes:

```bash
npm run setup-db
# or
yarn setup-db
```

This script will create the following collections in your Appwrite database:

- Risks
- Comments
- Solutions
- Votes
- Risk Analysis
- Reminders
- Departments

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

## Initial Setup

After running the application for the first time:

1. Register a new account
2. Use the Appwrite console to set the user's role to "admin" in the user preferences:
   - Go to your Appwrite Console
   - Navigate to Authentication > Users
   - Select your newly created user
   - Under Preferences, add:
     ```json
     {
       "role": "admin",
       "department": "",
       "reputation": 0,
       "receiveNotifications": true
     }
     ```

## Project Structure

- `app/`: Next.js app directory with routes and API endpoints
- `components/`: React components organized by feature
- `lib/`: Utility functions and business logic
- `models/`: Database models and schemas
- `store/`: State management using Zustand
- `types/`: TypeScript type definitions
- `utils/`: Helper utilities
- `public/`: Static assets

## Building for Production

```bash
npm run build
# or
yarn build
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

For Appwrite, you can either use Appwrite Cloud or self-host on your own infrastructure.
