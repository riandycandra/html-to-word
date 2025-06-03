const express = require('express');
const router = express.Router();

// Define your application routes here

const {
  OfficialScriptIdentitiesController
} = require('../app/Http/Controllers');

router.get('/', OfficialScriptIdentitiesController.index);
router.post('/officialscriptidentities/:number', OfficialScriptIdentitiesController.show);
router.get('/to-docx/:number', OfficialScriptIdentitiesController.toDocx);

module.exports = router;