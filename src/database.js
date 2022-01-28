const fs = require('fs')
const bcrypt = require('bcryptjs')

const handler = {
    open: (path) => {
        let file = fs.readFileSync(path)
        return JSON.parse(file)
    },
    write: async(path, data) => {
        let buffer = await JSON.stringify(data, null, 2)
        fs.writeFileSync(path, buffer)
        return true
    },
    findByKey: (db, key, value) => {
        for (let element = 0; element < db.length; element++) {
            if (db[element][key] == value) return db[element]
        }
        return null
    },
    indexOfId: (db, id) => {
        for (let i = 0; i < db.length; i++) {
            if (db[i].id == id) {
                return i
            }
        }
        return false
    },
    encodePassword: async(password) => {
        return await bcrypt.hash(password, 10)
    },
    comparePassword: async(password, lastPassword) => {
        return await bcrypt.compare(password, lastPassword)
    }
}



module.exports = handler