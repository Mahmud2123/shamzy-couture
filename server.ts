import express from 'express';
import cors from 'cors';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ FIXED CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://shamzy-coutures.vercel.app',  // Note: you have 'shamzy-coutures' (with an 's')
  'https://shamzy-couture-api.onrender.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Required for withCredentials: true
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

interface RouteEntry { route: string; fullPath: string; depth: number }

function walkDir(dir: string, basePath = ''): RouteEntry[] {
  const entries: RouteEntry[] = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      entries.push(...walkDir(fullPath, join(basePath, item)));
    } else if (item.endsWith('.ts') && !item.startsWith('_')) {
      const routeName = item.replace(/\.ts$/, '');
      let routePath = routeName === 'index' ? basePath : join(basePath, routeName);
      routePath = routePath.replace(/\\/g, '/').replace(/\[id\]/g, ':id');
      const depth = routePath.split('/').length;
      entries.push({ route: routePath, fullPath, depth });
    }
  }
  return entries;
}

async function loadRoutes() {
  const apiPath = join(__dirname, 'api');
  
  // Check if api directory exists
  if (!fs.existsSync(apiPath)) {
    console.warn('⚠️ API directory not found, skipping route loading');
    return;
  }
  
  const routeEntries = walkDir(apiPath);

  // Sort: more specific (deeper/longer) routes first
  routeEntries.sort((a, b) => {
    const aHasParam = a.route.includes(':id');
    const bHasParam = b.route.includes(':id');
    if (a.depth !== b.depth) return b.depth - a.depth;
    if (aHasParam !== bHasParam) return aHasParam ? 1 : -1;
    return a.route.localeCompare(b.route);
  });

  for (const { route, fullPath } of routeEntries) {
    try {
      const fileUrl = pathToFileURL(fullPath).href;
      const module = await import(fileUrl);
      const handler = module.default;
      if (typeof handler === 'function') {
        const fullRoute = `/api/${route}`;
        console.log(`✅ ${fullRoute}`);
        app.all(fullRoute, async (req, res) => {
          try { 
            await handler(req, res); 
          } catch (error: any) {
            console.error(`❌ ${fullRoute}:`, error);
            if (!res.headersSent) {
              res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
              });
            }
          }
        });
      }
    } catch (err: any) {
      console.error(`❌ Failed to load ${route}:`, err.message);
    }
  }
}

// Start server
async function startServer() {
  await loadRoutes();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SHAMZY COUTURE API → http://localhost:${PORT}`);
    console.log(`📡 Health → http://localhost:${PORT}/api/health`);
    console.log(`🌍 CORS allowed origins:`, allowedOrigins);
  });
}

startServer().catch(console.error);




