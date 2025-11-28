const express = require('express');
const router = express.Router();
const db = require('../db/config');

router.get('/', (req, res) => {
  db.query('SELECT * FROM blood', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;
