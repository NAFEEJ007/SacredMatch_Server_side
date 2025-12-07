const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f5tu4ht.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function checkStories() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const collection = db.collection("successStories");

    const stories = await collection.find({}).toArray();
    console.log(`Found ${stories.length} stories.`);
    stories.forEach((s, i) => {
        console.log(`Story ${i}: rating=${s.rating}, reviewStar=${s.reviewStar}, image=${s.coupleImage || s.imageLink}`);
    });

  } catch (error) {
    console.error("Error checking data:", error);
  } finally {
    await client.close();
  }
}

checkStories();
