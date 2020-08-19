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
  const sq: object = { name: name, password: password, email: email }
  console.log(sql)
  response.send(await create('users', sq))
})

app.post('/login', async (request, response) => {
  if (!request.body) {
    return response.send('err 400')
  }
  console.log(request.body)
  const login: string = request.body.name
  console.log(request.body.password)
  const password: string = salt + createHash('sha256').update(request.body.password).digest('hex')
  console.log(login, password)
  const sq = { name: login, password: password }
  const arr: Array<object> = await find('users', sq)
  console.log(arr, arr.length)
  if (arr.length === 0) response.send({ status: false })
  else response.send({ status: true })
})

app.delete('/', async (request, response) => {
  const name: string = request.query.name ? request.query.name.toString() : ''
  const sq: object = { name: name }
  response.send(await destroy('users', sq))
})

app.get('/', async (request, response) => {
  console.log(request.query)
  response.send(await find('users'))
})

app.listen(3000)

const find = (table: string, where: Record<string, any> = {}):Promise<Array<object>> => {
  let sql: string = 'SELECT * FROM ' + table
  const param: Array<string> = []
  const keys: Array<string> = (Object.keys(where))
  if (keys.length > 0) {
    sql += ' WHERE '
    for (const i in where) {
      sql += (i + ' = ? AND ')
      param.push(where[i])
    }
    sql = sql.slice(0, sql.length - 4)
  }
  console.log(sql, param)
  return new Promise<any>((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      rows.forEach((row) => {
        console.log(row)
      })
      resolve(rows)
    })
  }).catch(err => console.log(err))
}

const create = (table: string, where: Record<string, any>):Promise<Array<object>> => {
  let sql: string = 'INSERT INTO ' + table
  const param: Array<string> = []
  const keys: Array<string> = (Object.keys(where))
  if (keys.length === 3) {
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
  } else return
  return new Promise<any>((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      }
      rows.forEach((row) => {
        console.log(row)
      })
      resolve(rows)
    })
  }).catch(err => console.log(err))
}

const destroy = (table: string, where: Record<string, any> = {}):Promise<Array<object>> => {
  let sql: string = 'DELETE FROM ' + table
  const param: Array<string> = []
  const keys: Array<string> = (Object.keys(where))
  if (keys.length > 0) {
    sql += ' WHERE '
    for (const i in where) {
      sql += (i + ' = ? AND ')
      param.push(where[i])
    }
    sql = sql.slice(0, sql.length - 4)
  } else return
  console.log(sql, param)
  return new Promise<any>((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      }
      rows.forEach((row) => {
        console.log(row)
      })
      resolve(rows)
    })
  }).catch(err => console.log(err))
}
