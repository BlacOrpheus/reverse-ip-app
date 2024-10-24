const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://chidubemchinwuba01:w7NIcgKCKyxQ896I@reverse-ip.zywnr.mongodb.net/?retryWrites=true&w=majority&appName=reverse-ip', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('Failed to connect to MongoDB:', err));


const app = express();
const port = 5000;

// Middleware
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname)));

// Root route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB connection URI


// Route to get and reverse the client's IP
app.get('/get-reverse-ip', async (req, res) => {
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;


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



