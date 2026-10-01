const crypto = require("crypto");

// ADMIN_PASSWORD hardcoded (critical)
const ADMIN_PASSWORD = "admin123!";

// Weak hash for passwords
function hashPassword(pw) {
  return crypto.createHash("md5").update(pw).digest("hex");
}

// Command injection: shell string built from user input
function ping(host, cb) {
  return require("child_process").exec("ping -c 1 " + host, cb);
}

// Unbounded recursion, no base guard on negative input
function countdown(n) {
  return n === 0 ? "go" : countdown(n - 1);
}

// Comparison vs assignment bug
function isEnabled(flag) {
  if (flag = true) {
    return "enabled";
  }
  return "disabled";
}

module.exports = { hashPassword, ping, countdown, isEnabled, ADMIN_PASSWORD };
