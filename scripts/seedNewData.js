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

const divisions = ["Dhaka", "Chattagram", "Rangpur", "Barisal", "Khulna", "Mymensingh", "Sylhet"];
const occupations = ["Student", "Engineer", "Doctor", "Teacher", "Banker", "Business", "House wife"];
const maritalStatuses = ["Unmarried", "Divorced", "Widowed", "Separated"];
const races = ["Fair", "Brown", "Black", "White"];
const names = [
    "Ayesha Siddiqua", "Tanvir Hasan", "Sadia Islam", "Rahim Uddin", "Fatema Begum", 
    "Karim Sheikh", "Nusrat Jahan", "Abdullah Al Mamun", "Tasnim Akter", "Omar Faruk",
    "Meherun Nesa", "Sujon Ahmed", "Rina Khan", "Kamal Hossain", "Salma Khatun",
    "Jashim Uddin", "Rozina Akter", "Mizanur Rahman", "Shirin Akter", "Arif Hossain"
];

const fatherNames = [
    "Abdul Malek", "Rahman Ali", "Kabir Hossain", "Rafiqul Islam", "Nazrul Islam",
    "Siddiqur Rahman", "Mokbul Hossain", "Abul Kalam", "Shahjahan Ali", "Faruk Ahmed",
    "Jamal Uddin", "Kamal Pasha", "Anwar Hossain", "Delwar Hossain", "Monirul Islam",
    "Zahirul Islam", "Harun Or Rashid", "Mahbubur Rahman", "Nurul Islam", "Firoz Ahmed"
];

const motherNames = [
    "Fatema Begum", "Amina Khatun", "Rokeya Begum", "Sufia Khatun", "Jahanara Begum",
    "Nurjahan Begum", "Khaleda Zia", "Hasina Begum", "Rabeya Khatun", "Salma Begum",
    "Momtaz Begum", "Parvin Akter", "Nasrin Akter", "Rina Begum", "Shilpi Begum",
    "Lovely Akter", "Beauty Begum", "Dalia Akter", "Farida Yasmin", "Razia Sultana"
];

const images = [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=761&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBiodatas() {
    const biodatas = [];
    for (let i = 0; i < 20; i++) {
        const isMale = i % 2 !== 0;
        biodatas.push({
            biodataId: 101 + i,
            biodataType: isMale ? 'Male' : 'Female',
            name: names[i],
            profileImage: images[i % images.length],
            permanentDivision: getRandomItem(divisions),
            age: getRandomInt(20, 40),
            occupation: getRandomItem(occupations),
            maritalStatus: getRandomItem(maritalStatuses),
            race: getRandomItem(races),
            height: parseFloat((getRandomInt(45, 65) / 10).toFixed(1)), // 4.5 to 6.5
            weight: getRandomInt(45, 90),
            dateOfBirth: `${getRandomInt(1985, 2003)}-${getRandomInt(1, 12).toString().padStart(2, '0')}-${getRandomInt(1, 28).toString().padStart(2, '0')}`,
            isPremium: i < 6, // First 6 are premium
            contactEmail: `user${101 + i}@example.com`,
            mobileNumber: `017${getRandomInt(10000000, 99999999)}`,
            viewCount: getRandomInt(0, 100),
            fathersName: getRandomItem(fatherNames),
            mothersName: getRandomItem(motherNames),
            expectedPartnerAge: getRandomInt(20, 35),
            expectedPartnerHeight: parseFloat((getRandomInt(45, 65) / 10).toFixed(1)),
            expectedPartnerWeight: getRandomInt(45, 80)
        });
    }
    return biodatas;
}

async function seed() {
    try {
        await client.connect();
        const db = client.db(process.env.DB_NAME || "matrimonyDB");
        const biodatasCollection = db.collection("biodatas");

        // Clear existing data
        await biodatasCollection.deleteMany({});
        console.log("Cleared existing biodatas.");

        // Insert new data
        const newBiodatas = generateBiodatas();
        const result = await biodatasCollection.insertMany(newBiodatas);
        console.log(`Inserted ${result.insertedCount} new biodatas.`);

    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await client.close();
    }
}

seed();
