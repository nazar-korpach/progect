const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser({extended:  true}));
var sql
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
       return console.error(err.message);
    }
    console.log("Connected to the in-memory SQlite database.");
});

app.post('/', function(request, response){
    if (!request.body){
        return response.send('err 400')
    }
    var mode 
    for (i in request.body){
        mode = i
        break
    }

    const name = request.body[mode]
    sql = `INSERT INTO users (name) VALUES ('${name}') `;
    console.log(sql)
    let a = []
    const prom = new Promise(function(resolve, reject){
        const arr = []
        db.all(sql, [], (err, rows) => {
           if (err) {
                throw err;
            }
            rows.forEach((row) => {
                arr.push(row.name)
                console.log(row.name);
            });
        resolve()
        })
    }).then(response.send(""));
});

app.delete('/', function(request, response){
    if (!request.body){
        return response.send('err 400')
    }
    var mode 
    for (i in request.body){
        mode = i
        break
    }
    const name = request.body[mode]
    sql = `DELETE FROM users WHERE name =  ('${name}') `;
    console.log(sql);
    const prom = new Promise(function(resolve, reject){
        const arr = []
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((row) => {
                arr.push(row.name)
                console.log(row.name);
            });
        resolve()
        })
    }).then(response.send(""));
});

app.get('/', function(request, response){
    sql = "SELECT * FROM users";
    console.log(sql)
    const prom = new Promise(function(resolve, reject){
        const arr = []
        db.all(sql, [], (err, rows) => {
           if (err) {
                throw err;
            }
            rows.forEach((row) => {
                arr.push(row.name)
                console.log(row.name);
            });
        resolve(arr)
        });
    }).then(ar =>{
        response.send(ar)
    })
})

app.listen(3000)
