const express = require('express')
const bodyParser = require('body-parser');
const { response } = require('express');
const { compileFunction } = require('vm');
const app = express()

app.use(bodyParser({extended:  true}));
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
       return console.error(err.message);
    }
    console.log("Connected to the in-memory SQlite database.");
});

app.post('/', async (request, response) =>{
    if (!request.body){
        return response.send('err 400')
    }
    console.log(request.body)
    const name = request.body.name
    const password = request.body.password
    const email = request.body.email
    
    sql = `INSERT INTO users (name, password, email) VALUES ('${name}', '${password}', '${email}'); `;
    console.log(sql)
    response.send(await query(sql))
});

app.delete('/', async (request, response) =>{
    const name = request.query.name
    sql = `DELETE FROM users WHERE name =  ('${name}') `;
    response.send(await query(sql))
});

const query  = (sql) => {
    return new Promise((resolve, reject) => {
        const arr = []
        db.all(sql, [], (err, rows) => {
            if (err) {
               throw err;
            }
            rows.forEach((row) => {
               arr.push({
                name: row.name,
                password: row.password,
                email: row.email
               })
               console.log(row);
           });
           resolve(arr)
       });
   })
}

app.get('/', async (request, response) => {
    sql = "SELECT * FROM users";
    console.log(sql)
    console.log(request.query)
    response.send(await query(sql))
})

app.listen(3000)