import { env } from './src/config/env.js';
import { createApp } from './src/app.js';

const app = createApp();

if (env.warnings.length > 0) {
  env.warnings.forEach((w) => console.warn(`[BULLSIGHT CONFIG WARNING] ${w}`));
}

const server = app.listen(env.PORT, () => {
  console.log(
    `[BULLSIGHT API] Running on http://localhost:${env.PORT} (${env.NODE_ENV}) — Health: GET /api/health`
  );
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
