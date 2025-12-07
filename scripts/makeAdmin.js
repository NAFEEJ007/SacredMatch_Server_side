const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({ path: '../.env' });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f5tu4ht.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function makeAdmin(email) {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log(`User with email ${email} not found.`);
    } else if (result.modifiedCount === 0) {
      console.log(`User ${email} is already an admin or role not updated.`);
    } else {
      console.log(`Successfully updated ${email} to admin.`);
    }

  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    await client.close();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log("Please provide an email address. Usage: node makeAdmin.js <email>");
} else {
  makeAdmin(email);
}
