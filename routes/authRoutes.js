const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signupUser);
router.post("/agent-signup", authController.agentSignupUser);
router.post("/login", authController.loginUser);
router.post("/sendmoney", authController.handleSendMoney);
router.post("/cashout", authController.Cashout);
router.post("/show-balance", authController.showBalance);
module.exports = router;
