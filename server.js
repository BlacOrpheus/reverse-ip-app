const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json())
app.use(express.static(path.join(__dirname)));


// Define a GET endpoint at the root URL '/'
app.get('/', (req, res) => {
  // Send the 'index.html' file located in the same directory as this script
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Retrieve the MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI;

// Check if the URI is defined and starts with valid MongoDB prefixes
if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
  // If not valid, exit the process with a failure code
  process.exit(1);
}

// Create a new MongoClient instance with the provided URI
const client = new MongoClient(uri);

// Function to connect to the MongoDB database
async function connectToDatabase() {
  try {
    // Attempt to connect to the database
    await client.connect();
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    // Log an error message if the connection fails
    console.error("Failed to connect to MongoDB", err);
  }
}

// Call the function to initiate the database connection
connectToDatabase();

// Define a POST endpoint at '/get-reverse-ip'
app.post('/get-reverse-ip', async (req, res) => {
  try {
    // Extract the 'ip' property from the request body
    const { ip } = req.body;

    // Access the 'ipDatabase' database
    const db = client.db('ipDatabase');
    // Access the 'ipAddresses' collection within the database
    const collection = db.collection('ipAddresses');

    // Check if the 'ip' is provided in the request body
    if (!ip) {
      // If not provided, respond with a 404 status and no content
      return res.status(404).json();
    }

    // Reverse the IP address by splitting it into parts, reversing the array, and joining it back into a string
    const reversedIp = ip.split('.').reverse().join('.');
    
    // Check if the reversed IP already exists in the database
    const existingIp = await collection.findOne({ ip: reversedIp });

    // If the reversed IP already exists, respond with a message indicating so
    if (existingIp) {
      res.status(200).json({ message: 'IP already exists in the database', data: { reversedIp } });
      //console.log({message})
    } else {
      // If it does not exist, insert the reversed IP into the collection
      await collection.insertOne({ ip: reversedIp });
      // Respond with a success message indicating that the IP was inserted
      res.status(200).json({ message: 'Reversed IP inserted successfully', data: { reversedIp } });
      //console.log({message})
    }

  } catch (error) {
    // If an error occurs during processing, respond with a 500 status and the error message
    res.status(500).json({ message: error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




