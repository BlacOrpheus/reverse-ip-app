const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

// Initialize Express app
const app = express();

// MongoDB connection URI
const uri = 'mongodb+srv://chidubemchinwuba01:w7NIcgKCKyxQ896I@reverse-ip.zywnr.mongodb.net/reverse-ip?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log('MongoDB connected...');

        // Middleware
        app.use(cors());
        app.use(express.json());

        // Serve the static HTML file
        app.use(express.static(path.join(__dirname, 'index.html'))); // Assumes your frontend HTML is in the "public" folder

        // Route to get and reverse the user's IP
        app.get('/get-reverse-ip', async (req, res) => {
            // Get the user's IP from headers or request connection
            const userIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;

            if (!userIp) {
                return res.status(400).json({ error: 'Could not determine IP address' });
            }

            // Reverse the user's IP address
            const reversedIp = userIp.split('.').reverse().join('.');

            try {
                // Store the original and reversed IP in MongoDB
                const database = client.db('reverse-ip1'); // Use your database name here
                const collection = database.collection('ipAddresses');
                const newIp = { ip: userIp, reversedIp };

                await collection.insertOne(newIp);
                res.json({ reversedIp });
            } catch (error) {
                console.error('Error processing IP:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Define port and start the server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

// Run the main function to start the application
run().catch(console.error);