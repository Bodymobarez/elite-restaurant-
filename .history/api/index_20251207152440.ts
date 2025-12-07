import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { createServer } from "http";
import MemoryStore from "memorystore";

const app = express();
const httpServer = createServer(app);

// Debug endpoint to check environment
app.get("/api/debug", (req, res) => {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlLength: process.env.DATABASE_URL?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  });
});

// Import routes after debug endpoint
import { registerRoutes } from "../server/routes";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
    userRole: string;
  }
}

const MemoryStoreSession = MemoryStore(session);

// Trust proxy for Vercel
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "elite-hub-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000,
    }),
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    },
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Initialize routes synchronously for Vercel serverless
let routesInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeRoutes() {
  if (routesInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    await registerRoutes(httpServer, app);
    
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    
    routesInitialized = true;
  })();
  
  return initPromise;
}

// Start initialization immediately
initializeRoutes();

// Wrap the app to ensure routes are initialized before handling requests
const handler = async (req: Request, res: Response) => {
  await initializeRoutes();
  app(req, res);
};

export default handler;
