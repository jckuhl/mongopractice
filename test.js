// Bring in dependencies
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Start the Express app.
const app = express();

// Construct the Mongo connection string with pw and username stored in environment
const user = process.env.MONGO_USER;
const pw = process.env.MONGO_PW;
const uri = `mongodb+srv://${user}:${pw}@cluster0-vji0s.mongodb.net/test?retryWrites=true`;

/**
 * Querys the database for information
 * @param {Object} query A MongoDB query applicable for the .find() method
 */
function read(query={}) {
    return new Promise((resolve, reject)=> {
        MongoClient.connect(uri, {useNewUrlParser: true }, function(err, client) {
            if(err) {
                reject(err);
            } else {
                resolve(client);
            }
        });
    }).then(client => {
        return new Promise((resolve, reject)=> {
            const collection = client.db('first-test').collection('users');
            if(query) {
                query.name = new RegExp(query.name);
            }
            collection.find(query).toArray((err, generals)=> {
                if(err) {
                    reject(err);
                } else {
                    resolve(generals);
                }
            });
        });
    })
}

/**
 * Inserts a general into the general database.
 * @param {Object} general Any General object created by the form
 */
function insert(general) {
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        const collection = client.db("first-test").collection("users");
        collection.insertOne(general);
        client.close();
    });
}

/**
 * Removes the general with the given ID
 * @param {Object} id Shape: { _id: ObjectId("id hash")}
 */
function remove(id) {
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        const collection = client.db("first-test").collection("users");
        collection.deleteOne(id);
        client.close();
    });
}

// Updates a general with the given id . . . but how . . . ?
function update(general, query) {
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        const collection = client.db("first-test").collection("users");
        collection.updateOne(general, query, (error, doc)=> {
            console.log(doc);
            if(error) {
                response.sendStatus(500);
            }
        });
        client.close();
    });
}

// Middle ware, CORS and body-parser
app.use(cors());
app.use(bodyParser.json());

// Set the /generals route for GET requests to retrieve data
app.get('/generals', (request, response)=> {
    read().then(data => {
        response.send(JSON.stringify(data));
    });
});

// Search the generals using the provided query string
app.get('/generals/search', (request, response)=> {
    read(request.query).then(data => {
        response.send(JSON.stringify(data));
    });
});

// Set the /generals route for POST requests to insert data
app.post('/generals', (request, response)=> {
    insert(request.body);
    response.sendStatus(200);
});

// Set the /generals/delete route for DELETE requests to remove data
// Okay for this you'd want some added security, but this is just for funzies.
app.delete('/generals/delete', (request, response)=> {

    const query = {
        _id: new ObjectID(request.body._id)
    }

    remove(query);
    response.sendStatus(200);
});

// Set the /generals/update route for PUT requests to update data
app.put('/generals/update', (request, response)=> {
    const mongoFilter = {
        name: request.query.oname,
        side: request.query.oside
    };
    const mongoQuery = {
        '$set': {
            name: request.query.name,
            side: request.query.side
        }
    };
    update(mongoFilter, mongoQuery);
    response.sendStatus(200);
});

// Start the Express server
app.listen(3000, ()=> {
    console.log('listening on port 3000');
});