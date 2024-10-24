const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: '*', // Adjust the origin as necessary
  methods: ['GET', 'POST'],
}));;
app.use(express.static(path.join(__dirname)));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

// Create a MongoDB client
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

// Call the function to connect
connectToDatabase();

// Route to get and reverse the client's IP
app.get('/get-reverse-ip', async (req, res) => {
  let clientIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;
  console.log('Client IP:', clientIp);

  if (clientIp.includes('::ffff:')) {
    clientIp = clientIp.split('::ffff:')[1];  // Extract IPv4 part
  }

  try {
    const db = client.db('ipDatabase');
    const collection = db.collection('ipAddresses');

    let ipData = await collection.findOne({ ip: clientIp });
    if (!ipData) {
      await collection.insertOne({ ip: clientIp });
      ipData = { ip: clientIp };
    }

    const reversedIp = ipData.ip.split('.').reverse().join('.');
    res.json({ reversedIp });

  } catch (error) {
    console.error('Error processing IP:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
