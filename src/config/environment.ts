import dotenv from "dotenv";
import Mailgun from "mailgun.js";
import formData from "form-data";

dotenv.config();

export const config = {
  server: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    apiPrefix: process.env.API_PREFIX || "/api/v1",
    url: process.env.SERVER_URL || "http://localhost:3000/api/v1",
  },
  database: {
    database_url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "your_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
  },
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.EMAIL_FROM || "noreply@datingapp.com",
  },
  upload: {
    directory: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    allowedTypes: (
      process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/jpg"
    ).split(","),
  },
  cors: {
    origin: (
      process.env.CORS_ORIGIN || "http://localhost:3001,http://localhost:3000"
    ).split(","),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },
  mailGun: {
    apiKey: process.env.MAILGUN_API_KEY || "",
    domain: process.env.MAILGUN_DOMAIN || "",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
  },
  shopify: {
    domain: process.env.SHOPIFY_DOMAIN || "",
    accessToken: process.env.SHOPIFY_TOKEN || "",
  },
  firebase: {
    serviceAccountPath:
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "firebase-amiradnan.json",
  },
};

const mailgun = new Mailgun(formData);
export const mg: any = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

export default config;
