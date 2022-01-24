const db = require('../database')
const pathe = require('path')
const helper = {
    readBefore: async(path) => {
        return await db.open(pathe.join(__dirname, path))
    }
}

module.exports = helper