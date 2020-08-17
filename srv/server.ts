import * as express from 'express'
import * as bodyParser from 'body-parser'
import { createHash } from 'crypto'
import * as sqlite3 from 'sqlite3'
const app: express.Application = express()
const salt: string = '$2b$05$GhvtR0CxHt3r.sfk/RpOCu'

app.use(bodyParser({ extended: true }))
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    return console.error(err.message)
  }
  console.log('Connected to the in-memory SQlite database.')
})

app.post('/', async (request, response) => {
  if (!request.body) {
    return response.send('err 400')
  }
  console.log(request.body)
  const name: string = request.body.name
  const password: string = salt + createHash('sha256').update(request.body.password).digest('hex')
  const email: string = request.body.email
  const sql: string = 'INSERT INTO users (name, password, email) VALUES (?, ?, ?); '
  console.log(sql)
  response.send(await query(sql, [name, password, email]))
})

app.post('/login', async (request, response) => {
  if (!request.body) {
    return response.send('err 400')
  }
  console.log(request.body)
  const login: string = request.body.name
  console.log(request.body.password)
  const password: string = salt + createHash('sha256').update(request.body.password).digest('hex')
  const sql: string = `SELECT * FROM users 
    WHERE password = ? AND name = ?`
  console.log(login, password)
  const arr: Array<object> = await query(sql, [password, login])
  console.log(arr)
  console.log(arr.length)
  if (arr.length === 0) response.send({ status: false })
  else response.send({ status: true })
})

app.delete('/', async (request, response) => {
  const name: string = request.query.name.toString()
  const sql: string = 'DELETE FROM users WHERE name = ? '
  response.send(await query(sql, [name]))
})

app.get('/', async (request, response) => {
  const sql: string = 'SELECT * FROM users'
  console.log(sql)
  console.log(request.query)
  response.send(await query(sql, []))
})

app.listen(3000)

const query = (sql: string, param: Array<string>):Promise<Array<object>> => {
  return new Promise((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err) {
        throw err
      }
      rows.forEach((row) => {
        console.log(row)
      })
      resolve(rows)
    })
  })
}
