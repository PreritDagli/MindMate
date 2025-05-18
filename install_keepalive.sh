#!/bin/bash
# MindMate Keep-Alive Installer
# This script sets up the keep-alive solution for MindMate

# Exit on any error
set -e

echo "=== Installing MindMate Keep-Alive Solution ==="

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

# Check if keep_alive.mjs exists
if [ ! -f "keep_alive.mjs" ]; then
    echo "Creating keep_alive.mjs script..."
    cat > keep_alive.mjs << 'EOL'
// MindMate Keep-Alive Service
// This script helps keep your Replit running 24/7 without using the paid Deploy feature
import https from 'https';
import http from 'http';

// Configuration
const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes (just under Replit's 5-min sleep threshold)
// Get the actual hostname of this Replit
const hostname = process.env.REPL_SLUG ? 
                 `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
                 'localhost';
const appUrl = hostname;
const LOCAL_PORT = 3001; // Different from main app port

// Create a simple health check server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  const uptime = process.uptime();
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>MindMate Keep-Alive Service</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .online { background-color: #d4edda; color: #155724; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>MindMate Keep-Alive Service</h1>
      <div class="status online">
        <strong>Status:</strong> Running
      </div>
      <p><strong>Service uptime:</strong> ${Math.floor(uptime / 3600)} hours, ${Math.floor((uptime % 3600) / 60)} minutes, ${Math.floor(uptime % 60)} seconds</p>
      <p><strong>Next ping:</strong> In ${Math.floor(PING_INTERVAL / 1000)} seconds</p>
      <p><strong>Replit URL:</strong> <a href="https://${appUrl}" target="_blank">https://${appUrl}</a></p>
      <p>This service helps keep your MindMate application running continuously by sending regular pings.</p>
      <p><em>Last check: ${new Date().toLocaleString()}</em></p>
    </body>
    </html>
  `;
  
  res.end(html);
});

// Run the server on a different port than your main app
server.listen(LOCAL_PORT, '0.0.0.0', () => {
  console.log(`Keep-alive service running on port ${LOCAL_PORT}`);
  console.log(`Main application should be running on port 5000`);
});

// Log function with timestamp
function logWithTime(message) {
  const now = new Date();
  const timestamp = now.toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Ping function to keep the application alive
function pingApp() {
  logWithTime(`Pinging application at https://${appUrl}`);
  
  const req = https.request({
    hostname: appUrl,
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 10000, // 10 second timeout
    headers: {
      'User-Agent': 'MindMate-KeepAlive/1.0'
    }
  }, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      logWithTime(`Ping successful! Status: ${res.statusCode}`);
    });
  });
  
  req.on('error', (err) => {
    logWithTime(`Ping failed: ${err.message}`);
  });
  
  req.on('timeout', () => {
    logWithTime('Ping timed out');
    req.destroy();
  });
  
  req.end();
}

// Execute first ping immediately
pingApp();

// Schedule regular pings
setInterval(pingApp, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  logWithTime('Keep-alive service is shutting down...');
  server.close(() => {
    logWithTime('Server closed. Exiting process.');
    process.exit(0);
  });
});
EOL
    echo "✓ Created keep_alive.mjs script"
else
    echo "✓ keep_alive.mjs already exists"
fi

# Make the shell script executable
chmod +x keep_alive.mjs
echo "✓ Made scripts executable"

# Create a README section explaining the setup
if [ ! -f "README.md" ]; then
    echo "Creating README.md with keep-alive instructions..."
    cat > README.md << 'EOL'
# MindMate: Mental Wellness Platform

## Keeping Your Replit App Running 24/7 (Free Method)

MindMate includes a special keep-alive service that prevents your Replit from going to sleep. This allows you to have a continuously running application without using the paid "Deploy" feature.

### How to Use the Keep-Alive Service:

1. **Start the Main Application**: Make sure the "Start application" workflow is running.

2. **Start the Keep-Alive Service**: In a separate terminal, run:
   ```
   node keep_alive.mjs
   ```

3. **Verify Both Services are Running**:
   - Main app should be accessible at: `https://[your-repl-name].[your-username].repl.co`
   - Keep-alive service runs on port 3001 and can be viewed at: `https://[your-repl-name].[your-username].repl.co:3001`

4. **How it Works**:
   - The keep-alive service starts a small HTTP server on port 3001
   - It automatically pings your main application every 4 minutes
   - This prevents Replit from putting your application to sleep
   - The service includes a status dashboard where you can verify it's working

5. **For Maximum Reliability**:
   - Keep both the main application workflow AND the keep-alive terminal running
   - If you close your browser, both services will continue running on Replit
   - To maximize uptime, check back occasionally to ensure both services are still active
EOL
    echo "✓ Created README.md with instructions"
else
    echo "✓ README.md already exists"
fi

echo ""
echo "=== Installation Complete ==="
echo ""
echo "To start the keep-alive service, open a new Shell and run:"
echo "node keep_alive.mjs"
echo ""
echo "To check if it's working, visit your Replit URL at port 3001:"
echo "https://$(hostname):3001/"
echo ""
echo "Enjoy your 24/7 free MindMate deployment!"