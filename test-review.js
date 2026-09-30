const express = require('express');
const mysql = require('mysql');
const app = express();

// FAIL 1: credentials hardcodes dans le code
const DB_PASSWORD = "SuperSecret123!";
const API_KEY = "sk-live-4f8a9b2c1d3e5f6a7b8c9d0e";

// FAIL 2: injection SQL par concatenation
function getUser(username) {
  return `SELECT * FROM users WHERE name = '${username}'`;
}

// FAIL 3: eval sur entree utilisateur
app.get('/calc', (req, res) => {
  const result = eval(req.query.expression);
  res.send(String(result));
});

// FAIL 4: boucle avec erreur de logique (off-by-one + division par zero possible)
function average(nums) {
  let total = 0;
  for (let i = 0; i <= nums.length; i++) {
    total += nums[i];
  }
  return total / nums.length;
}

// FAIL 5: catch vide qui avale les erreurs
function connectDb() {
  try {
    return mysql.createConnection({ password: DB_PASSWORD });
  } catch (e) {}
}

module.exports = { getUser, average, connectDb, API_KEY };

// trigger: re-run AI review
// trigger: end-to-end test 18:11:31
