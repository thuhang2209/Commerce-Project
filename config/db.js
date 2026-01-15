/**
* Database connecttion
* Quan ly ket noi MongoDB
*/

require("dotenv").config();

const {MongoClient} = require("mongodb");

let db = null;
let client = null;

/**
*  Ket noi toi MongoDB
*/

async function connectDB() {
if (db) return db;

try {
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "projects";

client = new MongoClient(uri);
await client.connect();

db = client.db(dbName);
console.log(`[DB] Connected to MongoDB - Database: ${dbName}`);

return db;
} catch (error) {
console.error (` [DB] Wrong Connection:`, error.message);
throw error;
} 
}

/**
* Lay instance database
*/
function getDB() {
if (!db) {
throw new Error("Database cannot connect! Call connectDB() first");
}
return db;
}

/**
* Dong ket noi
*/
async function closeDB(){
if (client) {
await client.close();
db = null;
client = null;
console.log("[DB] Closed collection!");
}
}

module.exports = {
connectDB,
getDB,
closeDB
};
