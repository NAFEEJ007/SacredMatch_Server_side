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

async function updateStoryImage() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const collection = db.collection("successStories");

    const filter = { successStoryText: "Found my perfect match here. The process was smooth and trustworthy." };
    const updateDoc = {
      $set: {
        coupleImage: "https://images.unsplash.com/photo-1516589178581-a81aa8d1c672?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
      },
    };

    const result = await collection.updateOne(filter, updateDoc);
    console.log(`Updated ${result.modifiedCount} story image.`);

  } catch (error) {
    console.error("Error updating data:", error);
  } finally {
    await client.close();
  }
}

updateStoryImage();
