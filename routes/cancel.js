const express = require('express');
const router = express.Router();
const db = require('../db/config');

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM appointments WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.send('❌ Appointment canceled');
  });
});

module.exports = router;
