const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Root route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

// Check if the URI is defined
if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
  console.error('Invalid MongoDB URI');
  process.exit(1);
}

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

app.get('/get-reverse-ip', async (req, res) => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    return res.status(500).json({ error: 'Database connection error' });
  }


});

// Route to get and reverse the client's IP
app.get('/get-reverse-ip', async (req, res) => {
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('Request Headers:', req.headers);
  console.log('Initial client IP:', clientIp);

  // Handle IPv6 format, which may start with '::ffff:'
  if (clientIp.includes('::ffff:')) {
    clientIp = clientIp.split('::ffff:')[1];  // Extract IPv4 part
  }

  console.log('Processed client IP:', clientIp);

  try {
    // Check MongoDB connection
    await client.connect();
    console.log("Successfully connected to MongoDB");

    const db = client.db('ipDatabase');
    const collection = db.collection('ipAddresses');

    // Check if the IP exists in the database
    let ipData = await collection.findOne({ ip: clientIp });

    // If IP doesn't exist, insert it into the database
    if (!ipData) {
      await collection.insertOne({ ip: clientIp });
      ipData = { ip: clientIp };
    }

    // Reverse the IP address
    const reversedIp = ipData.ip.split('.').reverse().join('.');
    res.json({ reversedIp });

  } catch (error) {
    console.error('Error processing IP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
