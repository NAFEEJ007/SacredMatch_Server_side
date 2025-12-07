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

async function seedPremium() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const biodatasCollection = db.collection("biodatas");

    const dummyBiodatas = [
      {
        biodataId: 101,
        biodataType: 'Female',
        name: 'Sarah Khan',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Dhaka',
        age: 25,
        occupation: 'Student',
        isPremium: true,
        contactEmail: 'sarah@example.com',
        mobileNumber: '01700000001'
      },
      {
        biodataId: 102,
        biodataType: 'Male',
        name: 'Rahim Ahmed',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Chattagram',
        age: 29,
        occupation: 'Job',
        isPremium: true,
        contactEmail: 'rahim@example.com',
        mobileNumber: '01700000002'
      },
      {
        biodataId: 103,
        biodataType: 'Female',
        name: 'Nusrat Jahan',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80',
        permanentDivision: 'Sylhet',
        age: 24,
        occupation: 'House wife',
        isPremium: true,
        contactEmail: 'nusrat@example.com',
        mobileNumber: '01700000003'
      },
      {
        biodataId: 104,
        biodataType: 'Male',
        name: 'Karim Uddin',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Khulna',
        age: 32,
        occupation: 'Job',
        isPremium: true,
        contactEmail: 'karim@example.com',
        mobileNumber: '01700000004'
      },
      {
        biodataId: 105,
        biodataType: 'Female',
        name: 'Ayesha Siddiqua',
        profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80',
        permanentDivision: 'Rajshahi',
        age: 26,
        occupation: 'Student',
        isPremium: true,
        contactEmail: 'ayesha@example.com',
        mobileNumber: '01700000005'
      },
      {
        biodataId: 106,
        biodataType: 'Male',
        name: 'Tanvir Hasan',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Barisal',
        age: 30,
        occupation: 'Job',
        isPremium: true,
        contactEmail: 'tanvir@example.com',
        mobileNumber: '01700000006'
      }
    ];

    const result = await biodatasCollection.insertMany(dummyBiodatas);
    console.log(`${result.insertedCount} premium biodatas inserted successfully.`);

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.close();
  }
}

seedPremium();
