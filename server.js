const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const fetch = require('node-fetch');  // Ensure you're using the correct fetch for Node.js

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
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // In case of X-Forwarded-For, it might contain multiple IPs, use the first one
    if (clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0];
    }

    if (!clientIp) {
      return res.status(400).json({ message: 'Unable to retrieve client IP address' });
    }

    // Skip local IPs for external geolocation services
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
      return res.status(400).json({ message: 'Localhost IP cannot be processed' });
    }

    // Call the geolocation API (using ipinfo.io as an example)
    const response = await fetch(`https://ipinfo.io/${clientIp}?token=0e2a068a459bc6`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data from ipinfo.io');
    }

    const locationData = await response.json();
    console.log(locationData);

    // Reverse the IP
    const reversedIp = clientIp.split('.').reverse().join('.');

    // Access the MongoDB collection
    const db = client.db('ipDatabase');
    const collection = db.collection('ipAddresses');

    // Check if the reversed IP already exists in the database
    const existingIp = await collection.findOne({ ip: reversedIp });

    if (existingIp) {
      return res.status(200).json({ message: 'IP already exists in the database', data: { reversedIp, locationData } });
    }

    // Insert new reversed IP if not found
    await collection.insertOne({ ip: reversedIp });
    return res.status(201).json({ message: 'Reversed IP inserted successfully', data: { reversedIp, locationData } });

  } catch (error) {
    console.error('Error processing IP address', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
