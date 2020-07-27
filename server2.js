const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser({extended:  true}));

app.post('/', function(request, response){
    if (!request.body){
        return response.send('err 400')
    }
    var mode 
    for (i in request.body){
        mode = i
        console.log(mode)
        break
    }
    const sqlite3 = require('sqlite3').verbose();
    const name = request.body[mode]
    let db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
           return console.error(err.message);
        }
        console.log("Connected to the in-memory SQlite database.");
        });
        let sql;
        if (mode === "POST"){
            sql = `INSERT INTO users (name) VALUES ('${name}') `;
         }
        else if (mode === "DELETE"){
            sql = `DELETE FROM users WHERE name = '${name}'`;
        }
        else  {
            sql = "SELECT * FROM users";
        }
        console.log(sql);
        let a = []
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((row) => {
                a.push(row.name)
                console.log(row.name);
            });
            response.send(a)
        });
        db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Close the database connection.");
        console.log(a);
    });
    return
}).listen(3003);
