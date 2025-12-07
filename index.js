const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f5tu4ht.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    const db = client.db(process.env.DB_NAME || "matrimonyDB");
    const usersCollection = db.collection("users");
    const biodatasCollection = db.collection("biodatas");
    const favouritesCollection = db.collection("favourites");
    const contactRequestsCollection = db.collection("contactRequests");
    const successStoriesCollection = db.collection("successStories");

    // JWT related apis
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logging out', user);
      res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
    })

    // Middlewares
    const verifyToken = (req, res, next) => {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: 'unauthorized access' });
            }
            req.user = decoded;
            next();
        })
    }

    const verifyAdmin = async (req, res, next) => {
      const email = req.user.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    // Users related apis
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Check if user is admin
    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.user.email) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
          admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      // insert email if user doesnt exists: 
      // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users/premium-request/:email', verifyToken, async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updatedDoc = {
            $set: {
                premiumStatus: 'pending'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);

        // Also update biodata premiumRequestStatus
        const biodataFilter = { contactEmail: email };
        const biodataUpdate = {
            $set: {
                premiumRequestStatus: 'pending'
            }
        };
        await biodatasCollection.updateOne(biodataFilter, biodataUpdate);

        res.send(result);
    })

    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.patch('/users/premium/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: 'premium'
          }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);

        // Also update biodata isPremium status
        const user = await usersCollection.findOne(filter);
        if (user && user.email) {
            await biodatasCollection.updateOne(
                { contactEmail: user.email },
                { $set: { isPremium: true, role: 'premium', premiumRequestStatus: 'approved' } }
            );
        }

        res.send(result);
    })


    app.get('/users/premium/:email', verifyToken, async (req, res) => {
        const email = req.params.email;
        if (email !== req.user.email) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let premium = false;
        if (user) {
            premium = user?.role === 'premium';
        }
        res.send({ premium });
    })

    // Payment intent
    app.post('/create-payment-intent', verifyToken, async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price * 100);
        console.log(amount, 'amount inside the intent')

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
        });

        res.send({
          clientSecret: paymentIntent.client_secret
        })
    });

    // Contact Requests apis
    app.post('/contact-requests', verifyToken, async (req, res) => {
        const request = req.body;
        const result = await contactRequestsCollection.insertOne(request);
        res.send(result);
    })

    app.get('/contact-requests', verifyToken, async (req, res) => {
        const email = req.query.email;
        let query = {};
        if (email) {
            query = { selfEmail: email };
        }
        const result = await contactRequestsCollection.find(query).toArray();
        res.send(result);
    });

    app.delete('/contact-requests/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await contactRequestsCollection.deleteOne(query);
        res.send(result);
    })

    // Favourites apis
    app.post('/favourites', verifyToken, async (req, res) => {
        const favourite = req.body;
        const result = await favouritesCollection.insertOne(favourite);
        res.send(result);
    })

    app.get('/favourites', verifyToken, async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const result = await favouritesCollection.find(query).toArray();
        res.send(result);
    })

    app.delete('/favourites/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await favouritesCollection.deleteOne(query);
        res.send(result);
    })

    // Biodatas apis
    app.get('/biodatas', async (req, res) => {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const skip = page * limit;

        const query = {};
        if (req.query.type) {
            query.biodataType = req.query.type;
        }
        if (req.query.division) {
            query.permanentDivision = req.query.division;
        }
        if (req.query.ageMin && req.query.ageMax) {
            query.age = { $gte: parseInt(req.query.ageMin), $lte: parseInt(req.query.ageMax) };
        }
        if (req.query.biodataId) {
            const searchId = req.query.biodataId;
            const numId = parseInt(searchId);
            if (!isNaN(numId)) {
                query.$or = [{ biodataId: numId }, { biodataId: searchId }];
            } else {
                query.biodataId = searchId;
            }
        }
        if (req.query.maritalStatus) {
            query.maritalStatus = req.query.maritalStatus;
        }
        if (req.query.race) {
            query.race = req.query.race;
        }
        if (req.query.heightMin && req.query.heightMax) {
            query.height = { $gte: parseFloat(req.query.heightMin), $lte: parseFloat(req.query.heightMax) };
        }

        const result = await biodatasCollection.find(query).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
        const total = await biodatasCollection.countDocuments(query);
        
        res.send({
            result,
            total
        });
    })

    // Get Premium Biodatas (limit 6)
    app.get('/biodatas/premium', async (req, res) => {
        console.log('Hit /biodatas/premium');
        const result = await biodatasCollection.find({ isPremium: true }).sort({ _id: -1 }).limit(6).toArray();
        res.send(result);
    });

    app.get('/biodatas/:id', async (req, res) => {
        console.log('Hit /biodatas/:id', req.params.id);
        const id = req.params.id;
        let query = {};
        
        // Check if id is a valid ObjectId
        if (ObjectId.isValid(id)) {
             query = { _id: new ObjectId(id) };
        } else {
             // Assume it is a biodataId (number or string)
             const numId = parseInt(id);
             if (!isNaN(numId)) {
                 query = { $or: [{ biodataId: numId }, { biodataId: id }] };
             } else {
                 query = { biodataId: id };
             }
        }
        
        const result = await biodatasCollection.findOne(query);
        res.send(result);
    })

    // Increment View Count
    app.patch('/biodatas/view/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $inc: { viewCount: 1 }
        };
        const result = await biodatasCollection.updateOne(filter, updateDoc);
        res.send(result);
    });

    app.get('/biodatas/email/:email', async (req, res) => {
        const email = req.params.email;
        const query = { contactEmail: email };
        const result = await biodatasCollection.findOne(query);
        res.send(result);
    })

    app.post('/biodatas', verifyToken, async (req, res) => {
        const biodata = req.body;
        const query = { contactEmail: biodata.contactEmail };
        const exist = await biodatasCollection.findOne(query);

        if (exist) {
            const { _id, biodataId, ...updateData } = biodata;
            const result = await biodatasCollection.updateOne(query, { $set: updateData });
            res.send(result);
        } else {
            const lastBiodata = await biodatasCollection.find().sort({ biodataId: -1 }).limit(1).toArray();
            const newBiodataId = lastBiodata.length > 0 ? parseInt(lastBiodata[0].biodataId) + 1 : 1;
            biodata.biodataId = newBiodataId;
            const result = await biodatasCollection.insertOne(biodata);
            res.send(result);
        }
    })

    // Admin Stats
    app.get('/admin-stats', verifyToken, async (req, res) => {
        const totalBiodata = await biodatasCollection.estimatedDocumentCount();
        const maleBiodata = await biodatasCollection.countDocuments({ biodataType: 'Male' });
        const femaleBiodata = await biodatasCollection.countDocuments({ biodataType: 'Female' });
        const premiumBiodata = await biodatasCollection.countDocuments({ isPremium: true });
        
        const contactRevenueResult = await contactRequestsCollection.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$price" }
                }
            }
        ]).toArray();

        const premiumRevenueResult = await biodatasCollection.aggregate([
            {
                $match: { "premiumRequestInfo.amount": { $exists: true } }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$premiumRequestInfo.amount" }
                }
            }
        ]).toArray();
        
        const contactRevenue = contactRevenueResult.length > 0 ? contactRevenueResult[0].totalRevenue : 0;
        const premiumRevenue = premiumRevenueResult.length > 0 ? premiumRevenueResult[0].totalRevenue : 0;
        
        const totalRevenue = contactRevenue + premiumRevenue;

        res.send({
            totalBiodata,
            maleBiodata,
            femaleBiodata,
            premiumBiodata,
            totalRevenue
        });
    });

    // Manage Users
    app.get('/users', verifyToken, async (req, res) => {
        const search = req.query.search || "";
        const query = {
            name: { $regex: search, $options: 'i' }
        };
        const result = await usersCollection.find(query).toArray();
        res.send(result);
    });

    app.patch('/users/admin/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
    });

    app.patch('/users/premium/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: {
                role: 'premium'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);
        
        // Also update biodata isPremium status
        const user = await usersCollection.findOne(filter);
        if (user && user.email) {
            await biodatasCollection.updateOne(
                { contactEmail: user.email },
                { $set: { isPremium: true, role: 'premium', premiumRequestStatus: 'approved' } }
            );
        }
        
        res.send(result);
    });

    // Premium Approval Requests
    // User requests premium (updates biodata)
    app.post('/premium-requests', verifyToken, async (req, res) => {
        const { biodataId, transactionId, amount } = req.body;
        const filter = { biodataId: parseInt(biodataId) };
        const updatedDoc = {
            $set: {
                premiumRequestStatus: 'pending',
                premiumRequestInfo: {
                    transactionId,
                    amount: parseFloat(amount),
                    date: new Date()
                }
            }
        }
        const result = await biodatasCollection.updateOne(filter, updatedDoc);

        // Also update user collection so it appears in admin dashboard
        const biodata = await biodatasCollection.findOne(filter);
        if (biodata && biodata.contactEmail) {
             await usersCollection.updateOne(
                 { email: biodata.contactEmail },
                 { $set: { premiumStatus: 'pending' } }
             );
        }

        res.send(result);
    });

    // Admin gets premium requests
    app.get('/premium-approval-requests', verifyToken, async (req, res) => {
        const result = await usersCollection.aggregate([
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
                    _id: 1, // User ID
                    name: { $ifNull: ['$biodata.name', '$name'] },
                    contactEmail: '$email',
                    biodataId: '$biodata.biodataId',
                    isPremium: { $eq: ['$role', 'premium'] },
                    premiumStatus: 1
                }
            },
            {
                $sort: { premiumStatus: -1 }
            }
        ]).toArray();
        res.send(result);
    });

    // Admin approves premium
    app.patch('/premium-approval-requests/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }; // User ID
        const updatedDoc = {
            $set: {
                role: 'premium',
                premiumStatus: 'approved'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);
        
        // Also update the biodata
        const user = await usersCollection.findOne(filter);
        if (user && user.email) {
             await biodatasCollection.updateOne(
                 { contactEmail: user.email }, 
                 { $set: { isPremium: true, premiumRequestStatus: 'approved' } }
             );
        }

        res.send(result);
    });

    // Contact Requests (Admin View & User View)
    app.get('/contact-requests', verifyToken, async (req, res) => {
        const email = req.query.email;
        let query = {};
        if (email) {
            query = { selfEmail: email };
        }
        const result = await contactRequestsCollection.find(query).toArray();
        res.send(result);
    });

    app.patch('/contact-requests/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: {
                status: 'approved'
            }
        }
        const result = await contactRequestsCollection.updateOne(filter, updatedDoc);
        res.send(result);
    });
    
    // Delete contact request
    app.delete('/contact-requests/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await contactRequestsCollection.deleteOne(query);
        res.send(result);
    });

    // Success Stories
    app.get('/success-stories', async (req, res) => {
        const result = await successStoriesCollection.find().sort({ marriageDate: 1 }).toArray();
        res.send(result);
    });

    app.post('/success-stories', verifyToken, async (req, res) => {
        const story = req.body;
        const result = await successStoriesCollection.insertOne(story);
        res.send(result);
    });

    // Delete success story
    app.delete('/success-stories/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        console.log('Deleting success story with id:', id);
        const query = { _id: new ObjectId(id) };
        const result = await successStoriesCollection.deleteOne(query);
        res.send(result);
    });

    // Public Stats
    app.get('/public-stats', async (req, res) => {
        const totalBiodata = await biodatasCollection.estimatedDocumentCount();
        const maleBiodata = await biodatasCollection.countDocuments({ biodataType: 'Male' });
        const femaleBiodata = await biodatasCollection.countDocuments({ biodataType: 'Female' });
        const marriageCompleted = await successStoriesCollection.estimatedDocumentCount();

        res.send({
            totalBiodata,
            maleBiodata,
            femaleBiodata,
            marriageCompleted
        });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Matrimony Server is running')
})

app.listen(port, () => {
  console.log(`Matrimony Server is running on port ${port}`)
})

module.exports = app;
