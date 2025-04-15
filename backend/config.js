import "dotenv/config";

export const PORT = process.env.PORT || 5000;
export const CODEFORCES_KEY = process.env.CODEFORCES_KEY || "";
export const CODEFORCES_SECRET = process.env.CODEFORCES_SECRET || "";
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const FAILED_TIMEOUT = 1000*60*30;
export const COMPLETED_TIMEOUT = 1000*60*60*24;