// Load test env vars before anything else
process.env.JWT_SECRET = "test-secret-key-for-jest-only";
process.env.JWT_EXPIRES_IN = "1d";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.PORT = "3001";
process.env.GA4_SERVICE_ACCOUNT_KEY_PATH = "./secrets/ga4-service-account.json";
process.env.GA4_ACCOUNT_NAME = "accounts/123";
process.env.APP_BASE_URL = "http://localhost:3001";
