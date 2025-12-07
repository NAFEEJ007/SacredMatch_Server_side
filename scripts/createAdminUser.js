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

async function createAdmin() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const usersCollection = db.collection("users");

    const user = {
        name: "Super Admin",
        email: "admin@gmail.com",
        role: "admin",
        premium: true,
        photoURL: "https://i.ibb.co/4pDNDk1/avatar.png"
    };

    const existingUser = await usersCollection.findOne({ email: user.email });
    if (existingUser) {
        console.log("User already exists. Updating to admin...");
        await usersCollection.updateOne({ email: user.email }, { $set: { role: 'admin' } });
    } else {
        console.log("Creating new admin user...");
        await usersCollection.insertOne(user);
    }

    console.log("Admin user setup complete.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

createAdmin();
