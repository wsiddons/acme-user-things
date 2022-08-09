const pg = require('pg')
const client = new pg.Client('postgress://localhost/acme_user_things')
const fs = require('fs')
const express = require('express')
const app = express()

const readFile = (file) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(data.toString())
            }
        })
    })
}

app.get('/', async (req, res, next) => {
    try {
        const SQL = `
            SELECT things.name, users.name as user_name, things.id
            FROM things
            LEFT JOIN users
            ON users.id = things."userId"
            `
        const response = await client.query(SQL)
        const things = response.rows
        res.send(`
            <HTML>
                <head>
                    <title>acme users and things</title>
                </head>
                <body>
                    <h1>ACME USERS AND THINGS</h1>
                    <ul>
                        ${things.map(thing => {
            return `<li>
                    <a href='/things/${thing.id}'>${thing.name}</a> owned by ${thing.user_name || 'nobody'} 
            </li>`
        }).join('')
            }
                    </ul>
                </body>
            </HTML>
        `)
    }
    catch (ex) {
        next(ex)
    }
})

app.get('/things/:id', async (req, res, next) => {
    try {
        const SQL = `
            SELECT things.name, users.name as user_name, things.description
            FROM things
            LEFT JOIN users
            ON users.id = things."userId"
            WHERE things.id = $1
            `
        const response = await client.query(SQL, [req.params.id])
        const things = response.rows
        const thing = things[0]
        res.send(`
            <HTML>
                <head>
                    <title></title>
                </head>
                <body>
                    <h1>ACME USERS AND THINGS</h1>
                    <a href='/'>All Things</a>
                    <h3>details for ${thing.name}</h3>
                    <p>${thing.description}</p>
                </body>
            </HTML>
        `)
    }
    catch (ex) {
        next(ex)
    }
})

const init = async () => {
    try {
        console.log('started')
        await client.connect()
        const SQL = await readFile('seed.sql')
        await client.query(SQL)
        const port = process.env.PORT || 3000
        app.listen(port, () => console.log('u on dat shii'))
    }
    catch (ex) {
        console.log(ex)
    }

}
init()