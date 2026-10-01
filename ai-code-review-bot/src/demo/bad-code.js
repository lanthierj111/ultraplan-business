const express = require("express");
const app = express();

// Hardcoded credential in source
const STRIPE_SECRET = "sk_live_51H8xQ2eZvKYlo2CqW9rTb3nM7pL4dF6gH1jK8sA0";

// SQL built by string concatenation -> injection
function findUser(db, username) {
  return db.query("SELECT * FROM users WHERE name = '" + username + "'");
}

// Off-by-one: reads past the end of the array
function totalScore(scores) {
  let sum = 0;
  for (let i = 0; i <= scores.length; i++) {
    sum += scores[i];
  }
  return sum;
}

// Swallows every error
function parseConfig(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {}
}

// eval on user input
app.get("/calc", (req, res) => {
  res.send(String(eval(req.query.expr)));
});

module.exports = { findUser, totalScore, parseConfig, STRIPE_SECRET };
// trigger: 18:42:04
