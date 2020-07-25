const mysql = require('mysql')
const conn = mysql.createConnection( {
    host: 'localhost',
    user: 'UADEADUA-PC\UADEADUA',
    database: 'UADEADUA-PC\SQLEXPRESS',
    password: 'password'
})


const http = require('http');
const { compileFunction } = require('vm');
console.log('server is running')

http.createServer( (req, res) => {
    console.log('method', req.method)
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        let size = body.indexOf('/')
        if (body.slice(0, size) == 'GET'){
            res.end(sql(body.slice(0, size), body.slice(size + 1, body.length)))
        }
        if (body.slice(0, size) == 'DELETE'){
            sql('DELETE', body.slice(size + 1, body.length))
            res.end('user deleted')
        }
        if (body.slice(0, size) == 'POST'){
            console.log('POST')
            sql('POST', body.slice(size + 1, body.length))
            res.end('user added')
        }        
        res.end('invalid comand')
        })   
}).listen(3001)

const sql = function(rout, user){
    conn.connect( err => {
        if (err){
            console.log(err)
            return err
        }
        else {
            console.log('connected')
        }
    })
    if (rout == 'GET'){
        let query = 'SELECT * FROM  table '
        conn.query(query, (err, resoult) =>{
            console.log(err)
            return resoult    
    })}
    if (rout == 'POST'){
        let query = `INSERT INTO 'table' (user) VALUES (${user}) `
        conn.query(query, (err, resoult) =>{
            console.log(err)   
    })}
    if (rout == 'DELETE'){
        let query = `DELETE * FROM 'table' WHERE user = ${user} `
        conn.query(query, (err, resoult) =>{
            console.log(err)
    conn.end()    
    })}}