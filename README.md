# Interview Insights - AI-Powered Interview Coach

This is a Next.js application built in Firebase Studio. It allows users to practice for job interviews, get AI-powered feedback, and improve their communication skills.

## Running the Project Locally

Follow these steps to download and run this project on your local machine.

### 1. Download the Project
In Firebase Studio, find the option to "Download as ZIP" or "Export to .zip" to get a copy of the project files. Unzip the downloaded file on your computer.

### 2. Navigate to the Project Directory
Open your terminal or command prompt and use the `cd` command to go into the unzipped project folder.

```bash
cd path/to/your-project-folder
```

### 3. Install Dependencies
Install all the required packages using npm.

```bash
npm install
```

### 4. Set Up Environment Variables
Create a new file named `.env` in the root of your project directory. This file will hold your secret keys for Firebase and Google AI. Copy the contents of the `.env.example` file (if it exists) or use the template below and fill in your actual credentials.

You can find your Firebase project credentials in your [Firebase project settings](https://console.firebase.google.com/). You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Google AI (Gemini) API Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 5. Run the Development Server
Start the local development server using the following command:

```bash
npm run dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

## Key Features
- **Mock Interview**: Practice a live interview with an AI assistant.
- **Upload & Analyze**: Upload a past interview recording for in-depth analysis of your performance.
- **Improve Yourself**: Use targeted exercises to improve posture, eye contact, and speaking skills.
- **STAR Method Builder**: Structure your answers effectively using the STAR method.
