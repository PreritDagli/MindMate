import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import viteConfig from "../vite.config";
import { createServer } from "http";

// Main API app (shared between user and admin interfaces)
const apiApp = express();
apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: false }));

// Logging middleware
function setupLogging(app: express.Express) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });
}

// Setup logging for API app
setupLogging(apiApp);

// Error handling middleware
function setupErrorHandling(app: express.Express) {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });
}

(async () => {
  // Set up API routes
  const apiServer = await registerRoutes(apiApp);
  setupErrorHandling(apiApp);

  // User interface app (port 5000)
  const userApp = express();
  setupLogging(userApp);

  // Admin interface app (port 5001)
  const adminApp = express();
  setupLogging(adminApp);

  // Create HTTP servers
  const userServer = createServer(userApp);
  const adminServer = createServer(adminApp);

  // Add direct authentication endpoints that properly set content type
  userApp.post('/api/login', express.json(), (req, res, next) => {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);
    
    // Force JSON content type
    res.contentType('application/json');
    
    // Pass to API app
    apiApp(req, res, next);
  });
  
  // Add direct registration endpoint with proper JSON content type
  userApp.post('/api/register', express.json(), (req, res, next) => {
    console.log(`Registration attempt for user: ${req.body.username}`);
    
    // Force JSON content type
    res.contentType('application/json');
    
    // Pass to API app
    apiApp(req, res, next);
  });
  
  adminApp.post('/api/login', express.json(), (req, res, next) => {
    const { username, password } = req.body;
    console.log(`Admin login attempt for user: ${username}`);
    
    // Force JSON content type
    res.contentType('application/json');
    
    // Pass to API app
    apiApp(req, res, next);
  });
  
  adminApp.post('/api/register', express.json(), (req, res, next) => {
    console.log(`Admin registration attempt for user: ${req.body.username}`);
    
    // Force JSON content type
    res.contentType('application/json');
    
    // Pass to API app
    apiApp(req, res, next);
  });
  
  // Set up API routes 
  userApp.use('/api', apiApp);
  adminApp.use('/api', apiApp);

  // Set up Vite or serve static files for user interface
  if (process.env.NODE_ENV === "development") {
    const userViteConfig = {
      ...viteConfig,
      server: {
        ...viteConfig.server,
        port: 5000,
        strictPort: true,
      }
    };
    await setupVite(userApp, userServer, userViteConfig);
  } else {
    serveStatic(userApp);
  }

  // Set up Vite or serve static files for admin interface
  if (process.env.NODE_ENV === "development") {
    const adminViteConfig = {
      ...viteConfig,
      server: {
        ...viteConfig.server,
        port: 5001,
        strictPort: true,
      }
    };
    await setupVite(adminApp, adminServer, adminViteConfig);
  } else {
    serveStatic(adminApp);
  }

  // Admin middleware to secure admin routes
  adminApp.use((req, res, next) => {
    // Check if user is authenticated and is an admin in the session
    if (req.path.startsWith('/admin') && 
        (!req.isAuthenticated() || !(req.user as any)?.isAdmin)) {
      return res.redirect('/auth');
    }
    next();
  });

  // Start the user interface server on port 5000
  const userPort = process.env.PORT || 5000;
  const startUserServer = () => {
    userServer.listen({
      port: userPort,
      host: "0.0.0.0",
    }, () => {
      log(`User interface serving on port ${userPort}`);
    }).on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        log('Port 5000 is in use, retrying in 1 second...');
        setTimeout(startUserServer, 1000);
      } else {
        log(`Error starting user server: ${e.message}`);
      }
    });
  };
  startUserServer();

  // Start the admin interface server on port 5001
  const adminPort = 5001;
  const startAdminServer = () => {
    adminServer.listen({
      port: adminPort,
      host: "0.0.0.0",
    }, () => {
      log(`Admin interface serving on port ${adminPort}`);
    }).on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        log('Port 5001 is in use, retrying in 1 second...');
        setTimeout(startAdminServer, 1000);
      } else {
        log(`Error starting admin server: ${e.message}`);
      }
    });
  };
  startAdminServer();
})();