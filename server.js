const pg = require('pg')
const client = new pg.Client('postgress://localhost/acme_user_things')
const fs = require('fs')

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

const init = async () => {
    try {
        console.log('started')
        await client.connect()
        const SQL = await readFile('seed.sql')
        await client.query(SQL)
    }
    catch (ex) {
        console.log(ex)
    }

}
init()