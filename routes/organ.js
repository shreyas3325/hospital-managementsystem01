const express = require('express');
const router = express.Router();
const db = require('../db/config');

router.get('/', (req, res) => {
  db.query('SELECT * FROM organs', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { patient, organ_needed, blood_group, contact } = req.body;
  db.query('INSERT INTO organs SET ?', { patient, organ_needed, blood_group, contact }, (err) => {
    if (err) throw err;
    res.send('✅ Organ request added');
  });
});

module.exports = router;
