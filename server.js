const express = require('express');
const app = express();

app.use(express.json());
app.set('port', 3000);

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

const MongoClient = require("mongodb").MongoClient;

let db;

MongoClient.connect('mongodb+srv://athlon:23rdfeb@cluster0.gfygabo.mongodb.net', (err, client) => {
    db = client.db('webstore');
});

app.get('/', (req, res, next) => {
    res.send('Select a collection /collection/messages');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);

    return next();
});

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next (e);
        res.send(results);
    })
});

app.get('/collection/:collectionName/:search', (req, res, next) => {
    // let title = req.params.title;
    // let description = req.params.description;
    // // let searchCriteria = {
    // //     $or: [
    // //         { title: { $regex: title, $options: 'i' } }, 
    // //         { description: { $regex: description, $options: 'i' } }
    // //     ]
    // // };
    // req.collection.find({$or: [
    //     { title: { $regex: title, $options: 'i' } }, 
    //     { description: { $regex: description, $options: 'i' } }
    // ]}).toArray((e, results) => {
    //     if (e) return next (e);
    //     res.send(results);
    // })
    let search = req.params.search;
     req.collection.find({$or: [
        { title: { $regex: search, $options: 'i' } }, 
        { description: { $regex: search, $options: 'i' } }
    ]}).toArray((e, results) => {
        if (e) return next (e);
        console.log(results)
        res.send(results);
    })
});

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if(e) return next(e);
        res.send(results.ops);
    });
});

const ObjectID = require('mongodb').ObjectID;

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e, result) => {
        if(e) return next(e);
        res.send(result);
    })
})

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'});
        }
    )
});

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {_id: new ObjectID(req.params.id)},
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'});
        }
    )
})

// app.listen(3000, function(){
//     console.log("Port 3000");
// })
const port = process.env.PORT || 3000;
app.listen(port)