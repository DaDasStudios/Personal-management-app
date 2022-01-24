const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../database');
const helper = require('../helpers/getLast');

router.get('/', (req, res) => {
    res.render('index.ejs', { title: 'Home' })
})

router.get('/about', (req, res) => {
    res.render('about.ejs', { title: 'About' })
})

router.get('/contact', (req, res) => {
    res.render('contact.ejs', { title: 'Contact' })
})

router.post('/contact', (req, res) => {
    const lastData = helper.readBefore('../../database/contact.json')
    req.body.id = Date.now()
    lastData.contact.push(req.body)
    db.write(path.join(__dirname, '../../database/contact.json'), lastData)
    res.send('ok')
})

module.exports = router