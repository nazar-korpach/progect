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
  const sql: string = 'INSERT INTO users '
  const sq: object = { sql: sql, name: name, password: password, email: email }
  console.log(sql)
  response.send(await query(sq))
})

app.post('/login', async (request, response) => {
  if (!request.body) {
    return response.send('err 400')
  }
  console.log(request.body)
  const login: string = request.body.name
  console.log(request.body.password)
  const password: string = salt + createHash('sha256').update(request.body.password).digest('hex')
  const sql: string = 'SELECT * FROM users WHERE '
  console.log(login, password)
  const sq = { sql: sql, name: login, password: password }
  const arr: Array<object> = await query(sq)
  console.log(arr)
  console.log(arr.length)
  if (arr.length === 0) response.send({ status: false })
  else response.send({ status: true })
})

app.delete('/', async (request, response) => {
  const name: string = request.query.name.toString()
  const sql: string = 'DELETE FROM users WHERE '
  const sq: object = { sql: sql, name: name }
  response.send(await query(sq))
})

app.get('/', async (request, response) => {
  const sql: string = 'SELECT * FROM users'
  console.log(sql)
  console.log(request.query)
  const sq = { sql: sql }
  response.send(await query(sq))
})

app.listen(3000)

const toSQL = (where: Record<string, any>):Record<string, any> => {
  let sql: string = where.sql
  const param: Array<string> = []
  delete where.sql
  const keys: Array<string> = (Object.keys(where))
  if (keys.length > 0) {
    if (sql.slice(0, 6) === 'INSERT') {
      console.log('insert')
      sql += '('
      for (const i in where) {
        sql += i + ', '
        param.push(where[i])
      }
      sql = sql.slice(0, sql.length - 2)
      sql += ') VALUES ('
      for (const i in where) {
        sql += '?, '
      }
      sql = sql.slice(0, sql.length - 2) + ')'
      console.log(sql, param)
      return { sql: sql, params: param }
    }
    for (const i in where) {
      sql += (i + ' = ? AND ')
      param.push(where[i])
    }
    sql = sql.slice(0, sql.length - 4)
  }
  return { sql: sql, params: param }
}

const query = (where: Record<string, any>):Promise<Array<object>> => {
  return new Promise((resolve, reject) => {
    const buffer: Record<string, any> = toSQL(where)
    const sql = buffer.sql
    const param = buffer.params
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
