
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:root@tournaments-raem9.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = client;
