const express = require('express');
const router = express.Router();

// Define your application routes here

const {
  OfficialScriptIdentitiesController
} = require('../app/Http/Controllers');

router.get('/', (req, res) => { res.send('Hello world') })

router.get('/officialscriptidentities/:number', OfficialScriptIdentitiesController.show);

module.exports = router;