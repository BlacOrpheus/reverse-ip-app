const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json())
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const uri = process.env.MONGODB_URI;

if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
  process.exit(1);
}

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}
connectToDatabase();

app.post('/get-reverse-ip', async (req, res) => {
  try {
    const { ip } = req.body
    const db = client.db('ipDatabase');
    const collection = db.collection('ipAddresses');

    if (!ip) {
      return res.status(404).json()
    }

    const reversedIp = ip.split('.').reverse().join('.');
    await collection.insertOne({ ip: reversedIp });

    res.status(200).json({ data: { reversedIp } })
  } catch (error) {
    res.status(500).json({ message: error })
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



