import express from 'express';
import cors from 'cors';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

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
      // Normalize path separators and convert [id] to :id
      routePath = routePath.replace(/\\/g, '/').replace(/\[id\]/g, ':id');
      const depth = routePath.split('/').length;
      entries.push({ route: routePath, fullPath, depth });
    }
  }
  return entries;
}

async function loadRoutes() {
  const apiPath = join(__dirname, 'api');
  const routeEntries = walkDir(apiPath);

  // Sort: more specific (deeper/longer) routes first so :id doesn't swallow named routes
  routeEntries.sort((a, b) => {
    // Static segments beat param segments
    const aHasParam = a.route.includes(':id');
    const bHasParam = b.route.includes(':id');
    if (a.depth !== b.depth) return b.depth - a.depth; // deeper first
    if (aHasParam !== bHasParam) return aHasParam ? 1 : -1; // static before param
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
          try { await handler(req, res); }
          catch (error) {
            console.error(`❌ ${fullRoute}:`, error);
            if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
          }
        });
      }
    } catch (err: any) {
      console.error(`❌ Failed to load ${route}:`, err.message);
    }
  }
}

loadRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 SHAMZY COUTURE API → http://localhost:${PORT}`);
    console.log(`📡 Health → http://localhost:${PORT}/api/health\n`);
  });
});
