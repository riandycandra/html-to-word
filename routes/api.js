const express = require('express');
const router = express.Router();

// Define your API routes here

router.get('/', (req, res) => { res.send('Hello world') })

module.exports = router;