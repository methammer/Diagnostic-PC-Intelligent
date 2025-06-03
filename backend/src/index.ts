import express, { Express, Request, Response, NextFunction } from 'express';
import diagnosticRoutes from './routes/diagnostic.routes';

const app: Express = express();
const port = process.env.BACKEND_PORT || 3001;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour les logs de requêtes (simple)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[server]: ${req.method} ${req.url}`);
  next();
});

// Routes de l'API
app.use('/api', diagnosticRoutes);

// Route de base
app.get('/', (req: Request, res: Response) => {
  res.send('Backend server for PC Diagnostic Assistant is running with Express and TypeScript!');
});

// Gestionnaire d'erreurs simple
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[server]: Error: ${err.message}`);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`[server]: Backend server is running at http://localhost:${port}`);
});
