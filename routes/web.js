const express = require('express');
const router = express.Router();

// Define your application routes here

router.get('/', (req, res) => { res.send('Hello world') })

module.exports = router;