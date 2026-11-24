import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env if present, without overriding explicit process environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const VALID_ENVS = ['development', 'test', 'production'];

export function validateEnv() {
  const warnings = [];
  const rawPort = process.env.PORT || '5000';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT environment variable: "${rawPort}". Expected integer 1-65535.`);
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!VALID_ENVS.includes(nodeEnv)) {
    warnings.push(`Unrecognized NODE_ENV "${nodeEnv}"; defaulting behavior to development.`);
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  try {
    new URL(clientUrl);
  } catch {
    throw new Error(`Invalid CLIENT_URL "${clientUrl}". Must be a valid URL.`);
  }

  const marketDataApiKey = process.env.MARKET_DATA_API_KEY?.trim() || '';
  const marketDataProviderUrl = process.env.MARKET_DATA_PROVIDER_URL?.trim() || '';
  const newsApiKey = process.env.NEWS_API_KEY?.trim() || '';
  const pythonAiServiceUrl = process.env.PYTHON_AI_SERVICE_URL?.trim() || '';

  if (marketDataApiKey && !marketDataProviderUrl) {
    warnings.push('MARKET_DATA_API_KEY is set without MARKET_DATA_PROVIDER_URL; external provider disabled.');
  }

  return {
    PORT: port,
    NODE_ENV: nodeEnv,
    CLIENT_URL: clientUrl,
    MARKET_DATA_API_KEY: marketDataApiKey,
    MARKET_DATA_PROVIDER_URL: marketDataProviderUrl,
    NEWS_API_KEY: newsApiKey,
    PYTHON_AI_SERVICE_URL: pythonAiServiceUrl,
    warnings,
  };
}

export const env = validateEnv();
