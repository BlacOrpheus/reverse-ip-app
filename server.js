const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
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

// Route to get and reverse the client's IP
app.get('/get-reverse-ip', async (req, res) => {
  try {
    // Retrieve the client's IP address from the X-Forwarded-For header
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("Client IP:", clientIp);

    // Perform reversal
    const reversedIp = clientIp.split('.').reverse().join('.');

    // Update database
    const db = client.db('ipDatabase');
    const collection = db.collection('ipAddresses');
    await collection.insertOne({ ip: reversedIp });
    res.status(200).json({ data: { reversedIp } });

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
