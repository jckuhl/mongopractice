const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const user = process.env.MONGO_USER;
const pw = process.env.MONGO_PW;
const uri = `mongodb+srv://${user}:${pw}@cluster0-vji0s.mongodb.net/test?retryWrites=true`;

function readAll(query={}) {
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


function insert(general) {
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        const collection = client.db("first-test").collection("users");
        collection.insertOne(general);
        client.close();
    });
}

app.use(cors());
app.use(bodyParser.json());

app.get('/generals', (request, response)=> {
    readAll().then(data => {
        console.log(data);
        response.send(JSON.stringify(data));
    });
});

app.post('/generals', (request, response)=> {
    console.log(request.body);
    insert(request.body);
    response.sendStatus(200);
});

app.listen(3000, ()=> {
    console.log('listening on port 3000');
});