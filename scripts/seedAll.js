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

const biodatas = [
    // Premium Members (Ensuring 6 for the home page)
    {
        biodataId: 201,
        biodataType: 'Female',
        name: 'Ayesha Siddiqua',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=761&q=80',
        permanentDivision: 'Dhaka',
        age: 26,
        occupation: 'Doctor',
        isPremium: true,
        contactEmail: 'ayesha@example.com',
        mobileNumber: '01711111111',
        race: 'Asian',
        fathersName: 'Abdul Siddique',
        mothersName: 'Fatema Begum',
        dateOfBirth: '1998-05-15',
        height: '5\'4"',
        weight: '55 kg',
        expectedPartnerAge: 30,
        expectedPartnerHeight: '5\'8"',
        expectedPartnerWeight: '70 kg',
        contactEmail: 'ayesha@example.com',
        mobileNumber: '01711111111'
    },
    {
        biodataId: 202,
        biodataType: 'Male',
        name: 'Tanvir Hasan',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Chattagram',
        age: 30,
        occupation: 'Engineer',
        isPremium: true,
        contactEmail: 'tanvir@example.com',
        mobileNumber: '01711111112',
        race: 'Asian',
        fathersName: 'Hasan Ali',
        mothersName: 'Jahanara Begum',
        dateOfBirth: '1994-08-20',
        height: '5\'10"',
        weight: '75 kg',
        expectedPartnerAge: 25,
        expectedPartnerHeight: '5\'4"',
        expectedPartnerWeight: '55 kg'
    },
    {
        biodataId: 203,
        biodataType: 'Female',
        name: 'Sadia Islam',
        profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Sylhet',
        age: 24,
        occupation: 'Student',
        isPremium: true,
        contactEmail: 'sadia@example.com',
        mobileNumber: '01711111113',
        race: 'Asian',
        fathersName: 'Islam Uddin',
        mothersName: 'Rokeya Begum',
        dateOfBirth: '2000-01-10',
        height: '5\'3"',
        weight: '50 kg',
        expectedPartnerAge: 28,
        expectedPartnerHeight: '5\'7"',
        expectedPartnerWeight: '65 kg'
    },
    {
        biodataId: 204,
        biodataType: 'Male',
        name: 'Karim Chowdhury',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Khulna',
        age: 32,
        occupation: 'Banker',
        isPremium: true,
        contactEmail: 'karim@example.com',
        mobileNumber: '01711111114',
        race: 'Asian',
        fathersName: 'Chowdhury Saheb',
        mothersName: 'Mrs. Chowdhury',
        dateOfBirth: '1992-11-05',
        height: '5\'9"',
        weight: '78 kg',
        expectedPartnerAge: 27,
        expectedPartnerHeight: '5\'5"',
        expectedPartnerWeight: '60 kg'
    },
    {
        biodataId: 205,
        biodataType: 'Female',
        name: 'Farhana Akter',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=688&q=80',
        permanentDivision: 'Rajshahi',
        age: 27,
        occupation: 'Teacher',
        isPremium: true,
        contactEmail: 'farhana@example.com',
        mobileNumber: '01711111115',
        race: 'Asian',
        fathersName: 'Akter Hossain',
        mothersName: 'Salma Begum',
        dateOfBirth: '1997-03-25',
        height: '5\'5"',
        weight: '58 kg',
        expectedPartnerAge: 31,
        expectedPartnerHeight: '5\'9"',
        expectedPartnerWeight: '72 kg'
    },
    {
        biodataId: 206,
        biodataType: 'Male',
        name: 'Mahmudul Haque',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        permanentDivision: 'Barisal',
        age: 31,
        occupation: 'Business',
        isPremium: true,
        contactEmail: 'mahmudul@example.com',
        mobileNumber: '01711111116',
        race: 'Asian',
        fathersName: 'Haque Saheb',
        mothersName: 'Mrs. Haque',
        dateOfBirth: '1993-07-12',
        height: '5\'11"',
        weight: '80 kg',
        expectedPartnerAge: 26,
        expectedPartnerHeight: '5\'6"',
        expectedPartnerWeight: '60 kg'
    },
    // Regular Members
    {
        biodataId: 207,
        biodataType: 'Female',
        name: 'Rina Begum',
        profileImage: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=686&q=80',
        permanentDivision: 'Rangpur',
        age: 23,
        occupation: 'Student',
        isPremium: false,
        contactEmail: 'rina@example.com',
        mobileNumber: '01711111117',
        race: 'Asian',
        fathersName: 'Abdul Malek',
        mothersName: 'Sufia Begum',
        dateOfBirth: '2001-09-30',
        height: '5\'2"',
        weight: '48 kg',
        expectedPartnerAge: 26,
        expectedPartnerHeight: '5\'6"',
        expectedPartnerWeight: '65 kg'
    },
    {
        biodataId: 208,
        biodataType: 'Male',
        name: 'Sajid Khan',
        profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1148&q=80',
        permanentDivision: 'Mymensingh',
        age: 28,
        occupation: 'Freelancer',
        isPremium: false,
        contactEmail: 'sajid@example.com',
        mobileNumber: '01711111118',
        race: 'Asian',
        fathersName: 'Khan Saheb',
        mothersName: 'Mrs. Khan',
        dateOfBirth: '1996-02-14',
        height: '5\'8"',
        weight: '70 kg',
        expectedPartnerAge: 24,
        expectedPartnerHeight: '5\'3"',
        expectedPartnerWeight: '52 kg'
    }
];

const successStories = [
    {
        selfBiodataId: 202,
        partnerBiodataId: 201,
        coupleImage: 'https://images.unsplash.com/photo-1621621667797-e06afc217fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
        successStoryText: "We met through this platform and found our soulmates. Thank you SacredMatch!",
        marriageDate: "2024-01-15",
        rating: 5
    },
    {
        selfBiodataId: 204,
        partnerBiodataId: 205,
        coupleImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
        successStoryText: "A wonderful journey that started with a simple click. Highly recommended.",
        marriageDate: "2023-11-20",
        rating: 4
    },
    {
        selfBiodataId: 206,
        partnerBiodataId: 203,
        coupleImage: 'https://images.unsplash.com/photo-1529634806980-85c3ddf8b935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
        successStoryText: "Found my perfect match here. The process was smooth and trustworthy.",
        marriageDate: "2023-12-05",
        rating: 5
    }
];

async function seedAll() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const biodatasCollection = db.collection("biodatas");
    const successStoriesCollection = db.collection("successStories");

    // Clear existing data (optional, but helps avoid duplicates if running multiple times without unique index)
    // await biodatasCollection.deleteMany({});
    // await successStoriesCollection.deleteMany({});
    // console.log("Cleared existing biodatas and success stories.");

    // Insert Biodatas
    const biodataResult = await biodatasCollection.insertMany(biodatas);
    console.log(`${biodataResult.insertedCount} biodatas inserted successfully.`);

    // Insert Success Stories
    const storyResult = await successStoriesCollection.insertMany(successStories);
    console.log(`${storyResult.insertedCount} success stories inserted successfully.`);

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.close();
  }
}

seedAll();
