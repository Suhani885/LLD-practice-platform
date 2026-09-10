import dotenv from "dotenv";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  // In test env we fall back to safe defaults so the suite never needs a real .env file.
  mongodbUri: isTest
    ? (process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/lld-practice-test")
    : required("MONGODB_URI"),
  jwtSecret: isTest ? (process.env.JWT_SECRET ?? "test-secret") : required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
} as const;
