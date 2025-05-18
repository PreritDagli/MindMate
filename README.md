# MindMate: Mental Wellness Platform

MindMate is a comprehensive mental wellness platform that empowers users to track, understand, and improve their emotional health through advanced analytics, interactive interfaces, and personalized insights.

## Features

- **Daily Motivational Quotes**: Get inspired daily with quotes that can be saved and shared
- **Mood Tracking**: Track your moods with pattern analysis to gain insights
- **Personal Journaling**: Document your thoughts and feelings
- **Meditation & Breathing Exercises**: Practice mindfulness with guided sessions
- **Goal Tracking**: Set and monitor personal goals with progress visualization
- **Analytics Dashboard**: View detailed insights on your emotional patterns
- **Emotional Intelligence Quiz**: Test and improve your emotional intelligence
- **Admin Dashboard**: Comprehensive admin controls and user management

## Tech Stack

- React.js frontend with TypeScript
- Node.js/Express backend
- Drizzle ORM with PostgreSQL database
- Tailwind CSS for styling
- Recharts for data visualization

## Getting Started

### Running Locally

1. Clone this repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`

### Keeping Your Replit App Running 24/7 (Free Method)

MindMate includes a special keep-alive service that prevents your Replit from going to sleep. This allows you to have a continuously running application without using the paid "Deploy" feature.

#### How to Use the Keep-Alive Service:

1. **Start the Main Application**: 
   - Make sure the "Start application" workflow is running.
   - You should see a message: "serving on port 5000" in the workflow logs.

2. **Start the Keep-Alive Service**: 
   - In a separate shell tab, run:
   ```
   node keep_alive.mjs
   ```
   - You should see "Keep-alive service running on port 3001" and "Ping successful! Status: 200" in the logs.

3. **Verify Both Services are Running**:
   - Main app should be accessible at: `https://[your-repl-name].[your-username].repl.co`
   - Keep-alive service dashboard runs on port 3001 and provides a status page

4. **How it Works**:
   - The keep-alive service starts a small HTTP server on port 3001
   - It automatically pings your main application on port 5000 every 4 minutes
   - This prevents Replit from putting your application to sleep
   - The service includes a status dashboard showing uptime and ping status

5. **Tips for Maximum Reliability**:
   - Keep the "Start application" workflow running
   - Open a new shell tab and run `node keep_alive.mjs` 
   - Make sure both are running before closing your browser
   - Both services will continue running on Replit servers
   - To maximize uptime, check back occasionally to ensure both services are still active
   - If either stops, simply restart them
   - The Replit environment may restart on its own after extended periods (usually 1-2 weeks)

6. **Troubleshooting**:
   - If the main app stops responding, restart the "Start application" workflow
   - If the keep-alive service stops, open a new shell and run `node keep_alive.mjs` again
   - If your Replit URL isn't working, check that your Replit is set to "Public" in settings

## Default Login Credentials

- **Admin**: Username: `admin`, Password: `admin`
- **Test User**: Username: `user`, Password: `user`

## License

This project is licensed under the MIT License - see the LICENSE file for details.