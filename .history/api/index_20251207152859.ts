import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";
import MemoryStore from "memorystore";

const app = express();
const httpServer = createServer(app);

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

// Debug endpoint
app.get("/api/debug", (req, res) => {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlLength: process.env.DATABASE_URL?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  });
});

// Initialize routes
let routesInitialized = false;
let initPromise: Promise<void> | null = null;
let initError: Error | null = null;

async function initializeRoutes() {
  if (routesInitialized) return;
  if (initError) throw initError;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      await registerRoutes(httpServer, app);
      
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("Express error:", err);
        res.status(status).json({ message, error: err.toString() });
      });
      
      routesInitialized = true;
    } catch (error) {
      initError = error as Error;
      console.error("Failed to initialize routes:", error);
      throw error;
    }
  })();
  
  return initPromise;
}

// Handler for Vercel
const handler = async (req: Request, res: Response) => {
  try {
    await initializeRoutes();
    app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ 
      error: "Failed to initialize server",
      details: (error as Error).message,
      stack: (error as Error).stack
    });
  }
};

export default handler;
