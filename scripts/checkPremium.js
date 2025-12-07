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

async function checkPremium() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const biodatasCollection = db.collection("biodatas");

    const count = await biodatasCollection.countDocuments({ isPremium: true });
    console.log(`Premium Biodatas Count: ${count}`);
    
    const premiums = await biodatasCollection.find({ isPremium: true }).limit(6).toArray();
    console.log('Sample Premium:', premiums.length > 0 ? premiums[0].name : 'None');

  } catch (error) {
    console.error("Error checking data:", error);
  } finally {
    await client.close();
  }
}

checkPremium();
