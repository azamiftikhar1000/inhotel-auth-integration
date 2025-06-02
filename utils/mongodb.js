const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://pica:NOxXPJNWKymUsMJv@inhotel.6xjwr.mongodb.net/events-service?retryWrites=true&w=majority';

let client = null;
let db = null;

async function connectToMongoDB() {
  if (client && client.topology && client.topology.isConnected()) {
    return db;
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db('events-service');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function findUserAssistantMapping(secret) {
  try {
    const database = await connectToMongoDB();
    const collection = database.collection('user-assistant');
    
    // Determine if it's a test token or live token
    const isTestToken = secret.startsWith('sk_test');
    const fieldToMatch = isTestToken ? 'sandbox' : 'live';
    
    console.log(`Searching for ${fieldToMatch} token: ${secret.substring(0, 20)}...`);
    
    // Find document where the secret matches either sandbox or live field
    const document = await collection.findOne({
      [fieldToMatch]: secret
    });
    
    if (document) {
      console.log(`Found mapping for assistant_id: ${document.assistant_id}`);
      return {
        assistant_id: document.assistant_id,
        user_id: document.user_id,
        environment: isTestToken ? 'test' : 'live'
      };
    } else {
      console.log('No mapping found for the provided secret');
      return {
        assistant_id: null,
        user_id: null,
        environment: isTestToken ? 'test' : 'live'
      };
    }
  } catch (error) {
    console.error('Error finding user-assistant mapping:', error);
    return {
      assistant_id: null,
      user_id: null,
      environment: 'unknown',
      error: error.message
    };
  }
}

async function closeMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToMongoDB,
  findUserAssistantMapping,
  closeMongoDB
}; 