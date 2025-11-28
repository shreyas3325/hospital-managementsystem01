const express = require('express');
const router = express.Router();
const db = require('../db/config');

// Get all appointments
router.get('/', (req, res) => {
  db.query('SELECT * FROM appointments', (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Add appointment
router.post('/', (req, res) => {
  const { name, age, department, doctor, date } = req.body;
  db.query('INSERT INTO appointments SET ?', { name, age, department, doctor, date }, (err) => {
    if (err) throw err;
    res.send('Appointment added successfully!');
  });
});

module.exports = router;
