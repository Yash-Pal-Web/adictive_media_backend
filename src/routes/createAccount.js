const express = require("express");
const {
  createAccount,
  login,
} = require("../controllers/createAccount");


const router = express.Router();

router.post("/createAccount", createAccount);
router.post("/login", login)


module.exports = router;
