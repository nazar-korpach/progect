import express = require('express');
import bodyParser = require("body-parser");
import { response } from "express";
import { basename } from "path";
import { createHash } from 'crypto';
const app: express.Application = express();
const salt: string = "$2b$05$GhvtR0CxHt3r.sfk/RpOCu";

app.use(bodyParser({ extended: true }));
import sqlite3 =  require("sqlite3");
import { strict } from "assert";
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
    console.log(request.body);
    const name: string = request.body.name;
    const password: string = salt + createHash("sha256").update(request.body.password).digest("hex");
    const email: string = request.body.email;
    let sql: string = `INSERT INTO users (name, password, email) VALUES (?, ?, ?); `;
    console.log(sql);
    response.send(await query(sql, [name, password, email] ) );
});

app.post("/login", async (request, response) =>{
    if (!request.body){
        return response.send('err 400')
    }
    console.log(request.body);
    const login: string = request.body.name;
    console.log(request.body.password);
    const password: string = salt + createHash("sha256").update(request.body.password).digest("hex");
    let sql: string = `SELECT * FROM users 
    WHERE password = ? AND name = ?`;
    console.log(login, password);
    const arr: Array<JSON> = await query(sql, [password, login]);
    console.log(arr);
    console.log(arr.length);
    if (arr.length === 0) response.send({status: false})
    else response.send({status: true})
});

app.delete("/", async (request, response) =>{
    const name = request.query.name;
    let sql: string  = `DELETE FROM users WHERE name = ? `;
    response.send(await query(sql, [name]))
});

app.get("/", async (request, response) => {
    let sql: string = "SELECT * FROM users";
    console.log(sql);
    console.log(request.query);
    response.send(await query(sql, []))
})

app.listen(3000)

const query  = (sql: string, param):Promise<Array<JSON>> =>  {
    return new Promise((resolve, reject) =>  {
        db.all(sql, param, (err, rows) => {
            if (err) {
               throw err;
            }
            rows.forEach((row) => {
               console.log(row);
           });
           console.log(rows);
           resolve(rows)
       });
   })
}