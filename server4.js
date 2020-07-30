const express = require('express')
const bodyParser = require('body-parser');
const { response } = require('express');
const { compileFunction } = require('vm');
const { basename } = require('path');
const bcrypt = require('bcrypt');
const app = express()
const salt = "$2b$05$GhvtR0CxHt3r.sfk/RpOCu"

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
    //const name = (Buffer.from(request.body.name).toString("base64"))
    //const password = (Buffer.from(request.body.password).toString("base64"))
    //const email = (Buffer.from(request.body.email).toString("base64"))
    const name = request.body.name
    //const password = request.body.password
    const password = bcrypt.hashSync(request.body.password, salt)
    const email = request.body.email
    sql = `INSERT INTO users (name, password, email) VALUES (?, ?, ?); `;
    console.log(sql)
    response.send(await query(sql, [name, password, email] ) )
});

app.delete("/", async (request, response) =>{
    //const name = (Buffer.from(request.query.name).toString("base64"))
    const name = request.query.name
    sql = `DELETE FROM users WHERE name = ? `;
    response.send(await query(sql, [name]))
});

app.post("/:login", async (request, response) =>{
    if (!request.body){
        return response.send('err 400')
    }
    const login = request.path;
    console.log(request.path)
    const password = request.body.password
    sql = `SELECT * FROM users 
    WHERE password = ? AND name = ?;
    `;
    console.log(sql);
    const arr = await query(sql, [password, login]);
    if (arr.lenth = 0) response.send({status: true})
    else response.send({status: false})
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
        const arr = []
        db.all(sql, param, (err, rows) => {
            if (err) {
               throw err;
            }
            rows.forEach((row) => {
               arr.push({
                name: (Buffer.from(row.name, "base64").toString("ascii")),
                password: (Buffer.from(row.password, "base64").toString("ascii")),
                email: (Buffer.from(row.email, "base64").toString("ascii"))
               })
               console.log(arr);
           });
           resolve(rows)
       });
   })
}