const express = require("express");

const bodyParser = require('body-parser')

const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;


const expressLogging = require('express-logging')
const logger = require('logops')
app.use(bodyParser.json());

app.use(expressLogging(logger, {}));

// folosim folderul pages ca pe un folder static, adice de aici putem trimite pagini, imagini etc

app.use(express.static('pages'));


// json db

const dbPaths = {
    products: './db/products.json',
    users: './db/users.json',
};

const db = {
    users: [],
    products: []
}

let loadDb = () => {
    // read users:
    let usersData = JSON.parse(fs.readFileSync(dbPaths['users']).toString()).users;
    let productsData = JSON.parse(fs.readFileSync(dbPaths['products']).toString()).products;
    db.users = []
    db.products = []
    Array.prototype.push.apply(db.users, usersData);
    Array.prototype.push.apply(db.products, productsData);
}

let saveDb = () => {
    // read users:
    fs.writeFileSync(dbPaths['users'], JSON.stringify({ users: db.users}, null, 4))
    fs.writeFileSync(dbPaths['products'], JSON.stringify({products: db.products}, null, 4))
}

loadDb()

app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname + "/pages/"});
});

app.get('/api/products', function (req, res) {
    let productsData = {
        products: db.products
    }
    res.json(productsData);
})

// add a new product to the server
app.post('/api/products', function (req, res) {

    let id = 1
    let ids = db.products.map(prod => prod.id)
    while (ids.includes(id)) {
        ++id
    }

    db.products.push({id: id, ...req.body})

    saveDb()

    res.send({status: 'OK'})
})

// query a product by partial name:
app.get('/api/products/query/:query', function (req, res) {
    const query = req.params.query;
    const queryWords = query.split(' ')
    console.log(queryWords)
    // list all items that have words in common, case insensitive

    let productsResult = [];
    for (let product of db.products) {
        let productName = product.name.toLowerCase()

        let addToResult = false;
        for (let word of queryWords) {
            if (word.length > 1 && productName.includes(word)) {
                addToResult = true;
            }
        }
        if (addToResult) {
            productsResult.push(product);
        }
    }

    res.json({products: productsResult});
})

// CRUD on an product
app.patch('/api/products/:id', function (req, res) {
    const json = req.body

    const id = parseInt(json.id),
        stock = parseInt(json.stock)
    // update the product list:
    db.products.filter(p => p.id === id)[0].stock = stock

    saveDb()

    res.json(db.products.filter(p => p.id === id)[0])

})
app.delete('/api/products/:id', function (req, res) {
    const id = parseInt(req.params.id)
    for (let index = 0; index < db.products.length; index++) {
        if (db.products[index].id === id) {
            db.products.splice(index, 1);
        }
    }
    console.log(db)
    saveDb()
    res.send('DELETE success')
})

app.listen(port, function () {
    console.log("Listening on " + port);
});