/**
 * db.js - Phiên bản tối ưu cho Vercel (Native MongoDB Driver)
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "projects";

if (!uri) {
  throw new Error(
    "❌ Thiếu biến môi trường MONGODB_URI trong file .env hoặc Vercel Settings"
  );
}

let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  // 1. Nếu đã có kết nối trong bộ nhớ thì dùng lại ngay (Rất quan trọng cho Vercel)
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // 2. Nếu chưa có, tạo kết nối mới
  try {
    const client = new MongoClient(uri, {
      // Các tùy chọn này giúp kết nối ổn định hơn trên Serverless
      connectTimeoutMS: 10000, // 10 giây timeout
      socketTimeoutMS: 45000,
    });

    await client.connect();

    cachedClient = client;
    cachedDb = client.db(dbName);

    console.log(`✅ [DB] New connection established to: ${dbName}`);
    return cachedDb;
  } catch (error) {
    console.error("❌ [DB] Connection failed:", error.message);
    throw error;
  }
}

function getDB() {
  if (!cachedDb) {
    throw new Error("Database not initialized. Call connectDB() first!");
  }
  return cachedDb;
}

module.exports = { connectDB, getDB };
