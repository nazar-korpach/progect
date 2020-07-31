const express = require("express");
const bodyParser = require("body-parser");
const { response } = require("express");
const { compileFunction } = require("vm");
const { basename } = require("path");
const crypto = require("crypto");
const app = express();
const salt = "$2b$05$GhvtR0CxHt3r.sfk/RpOCu";

app.use(bodyParser({extended:  true}));
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
       return console.error(err.message);
    }
    console.log("Connected to the in-memory SQlite database.");
});

app.post("/", async (request, response) =>{
    if (!request.body){
        return response.send('err 400')
    }
    console.log(request.body)
    const name = request.body.name;
    const password = salt + crypto.createHash("SHA256").update(request.body.password).digest("hex");
    const email = request.body.email;
    sql = `INSERT INTO users (name, password, email) VALUES (?, ?, ?); `;
    console.log(sql);
    response.send(await query(sql, [name, password, email] ) );
});

app.post("/login", async (request, response) =>{
    if (!request.body){
        return response.send('err 400')
    }
    const login = request.body.name;
    const password = salt + crypto.createHash("SHA256").update(request.body.password).digest("hex");
    sql = `SELECT * FROM users 
    WHERE password = ? AND name = ? `;
    console.log(login);
    const arr = await query(sql, [password, login]);
    console.log(arr);
    console.log(arr.length);
    if (arr.length === 0) response.send({status: false})
    else response.send({status: true})
});

app.delete("/", async (request, response) =>{
    const name = request.query.name
    sql = `DELETE FROM users WHERE name = ? `;
    response.send(await query(sql, [name]))
});

app.get("/", async (request, response) => {
    sql = "SELECT * FROM users";
    console.log(sql)
    console.log(request.query)
    response.send(await query(sql, []))
})

app.listen(3000)

const query  = (sql, param) => {
    return new Promise((resolve, reject) => {
        db.all(sql, param, (err, rows) => {
            if (err) {
               throw err;
            }
            rows.forEach((row) => {
               console.log(row)
           });
           console.log(rows)
           resolve(rows)
       });
   })
}