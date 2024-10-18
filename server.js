const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Middleware
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname)));

// Root route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB connection URI
const uri = 'mongodb://admin:password123@localhost:27017/ipDatabase?authSource=admin';

// Create a MongoDB client outside of the request handler for reuse
const client = new MongoClient(uri);

(async () => {
  try {
    // Establish the MongoDB connection once at startup
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
})();

// Route to get and reverse the client's IP
app.get('/get-reverse-ip', async (req, res) => {
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Convert ::1 (IPv6 loopback) to 127.0.0.1 (IPv4 loopback)
  if (clientIp === '::1') {
    clientIp = '127.0.0.1';
  }

  try {
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
