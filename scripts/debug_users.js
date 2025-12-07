const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f5tu4ht.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const usersCollection = db.collection("users");

    console.log("Connected to DB");

    const allUsers = await usersCollection.find({}).toArray();
    console.log("Total users:", allUsers.length);

    const premiumUsers = await usersCollection.find({ role: 'premium' }).toArray();
    console.log("Users with role 'premium':", premiumUsers.length);
    premiumUsers.forEach(u => console.log(` - ${u.name} (${u.email})`));

    const pendingUsers = await usersCollection.find({ premiumStatus: 'pending' }).toArray();
    console.log("Users with premiumStatus 'pending':", pendingUsers.length);
    pendingUsers.forEach(u => console.log(` - ${u.name} (${u.email})`));

    const aggregationResult = await usersCollection.aggregate([
        {
            $match: {
                $or: [
                    { role: 'premium' },
                    { premiumStatus: 'pending' }
                ]
            }
        },
        {
            $lookup: {
                from: 'biodatas',
                localField: 'email',
                foreignField: 'contactEmail',
                as: 'biodata'
            }
        },
        {
            $unwind: {
                path: '$biodata',
                preserveNullAndEmptyArrays: true 
            }
        },
        {
            $project: {
                _id: 1, 
                name: { $ifNull: ['$biodata.name', '$name'] },
                contactEmail: '$email',
                biodataId: '$biodata.biodataId',
                isPremium: { $eq: ['$role', 'premium'] },
                premiumStatus: 1
            }
        }
    ]).toArray();

    console.log("Aggregation Result Count:", aggregationResult.length);
    console.log(JSON.stringify(aggregationResult, null, 2));

  } finally {
    await client.close();
  }
}

run().catch(console.dir);