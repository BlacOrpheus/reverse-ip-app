const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

// Ensure URI is defined and valid
if (!uri) {
  console.error('MongoDB URI is not defined in the environment variables.');
  process.exit(1);
}

// Create a MongoClient instance
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Connect to the database on startup
connectToDatabase();

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle the reverse IP logic and interaction with MongoDB
app.post('/get-reverse-ip', async (req, res) => {
  try {
    // Get the client IP from the request headers (X-Forwarded-For via NGINX ingress)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!clientIp) {
      return res.status(400).json({ message: 'Unable to retrieve client IP address' });
    }

    // Reverse the IP
    const reversedIp = clientIp.split('.').reverse().join('.');

    // Access the MongoDB collection
    const db = client.db('ipDatabase');
    const collection = db.collection('ipAddresses');

    // Check if the reversed IP already exists in the database
    const existingIp = await collection.findOne({ ip: reversedIp });

    if (existingIp) {
      return res.status(200).json({ message: 'IP already exists in the database', data: { reversedIp } });
    }

    // Insert new reversed IP if not found
    await collection.insertOne({ ip: reversedIp });
    return res.status(201).json({ message: 'Reversed IP inserted successfully', data: { reversedIp } });

  } catch (error) {
    console.error('Error processing IP address', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
