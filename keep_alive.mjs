// MindMate Keep-Alive Service
// This script helps keep your Replit running 24/7 without using the paid Deploy feature
import https from 'https';
import http from 'http';

// Configuration
const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes (just under Replit's 5-min sleep threshold)
// Since we can't reliably get the Replit URL using environment variables,
// we'll just ping localhost:5000 which is where our app is running.
// This will keep the Replit active which is what we want.
const appUrl = 'localhost';
const appPort = 5000;
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
  
  // Try to get actual Replit URL from headers
  const replitUrl = req.headers.host || 'unknown-replit.repl.co';
  
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
        .flex { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .blue { color: #3b82f6; }
      </style>
    </head>
    <body>
      <div class="flex">
        <div class="logo">Mind<span class="blue">Mate</span></div>
        <p>Keep-Alive Service</p>
      </div>
      <h1>MindMate Keep-Alive Service</h1>
      <div class="status online">
        <strong>Status:</strong> Running
      </div>
      <p><strong>Service uptime:</strong> ${Math.floor(uptime / 3600)} hours, ${Math.floor((uptime % 3600) / 60)} minutes, ${Math.floor(uptime % 60)} seconds</p>
      <p><strong>Next ping:</strong> In ${Math.floor(PING_INTERVAL / 1000)} seconds</p>
      <p><strong>Monitoring:</strong> http://${appUrl}:${appPort}/</p>
      <p><strong>Public URL:</strong> <a href="https://${replitUrl}" target="_blank">https://${replitUrl}</a></p>
      <hr>
      <p>This service helps keep your MindMate application running continuously by sending regular pings.</p>
      <p><em>Last check: ${new Date().toLocaleString()}</em></p>
      <p><em>Ping interval: Every ${PING_INTERVAL/1000/60} minutes</em></p>
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
  logWithTime(`Pinging application at http://${appUrl}:${appPort}`);
  
  const req = http.request({
    hostname: appUrl,
    port: appPort,
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