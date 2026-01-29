
# ISL Bridge Deployment Guide

This project is a React-based web application designed to bridge the gap between Indian Sign Language (ISL) and English using AI.

## How to Host

### 1. Deploying to Vercel (Easiest)
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. **Important**: Under "Environment Variables", add a new key named `API_KEY` and paste your Gemini API key as the value.
5. Click **"Deploy"**.

### 2. Deploying to Netlify
1. Log in to [Netlify](https://netlify.com).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Connect to GitHub and select your repo.
4. Under **"Site configuration"** -> **"Environment variables"**, add `API_KEY`.
5. Click **"Deploy site"**.

### 3. Local Hosting
To run the project locally on your machine:
1. Install dependencies: `npm install`
2. Create a `.env` file and add: `VITE_API_KEY=your_actual_api_key_here`
3. Run the development server: `npm run dev`
4. Open `http://localhost:3000` in your browser.

## Tech Stack
- **Framework**: React 19
- **AI Engine**: Gemini 3 & 2.5 series
- **Styling**: Tailwind CSS
- **Deployment**: Vite
