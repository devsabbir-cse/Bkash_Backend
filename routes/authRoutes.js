const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signupUser);
router.post("/agent-signup", authController.agentSignupUser);

router.post("/login", authController.loginUser);
router.post("/agentlogin", authController.agentloginUser);
router.post("/organizationlogin", authController.organizationlogin);

router.post("/sendmoney", authController.handleSendMoney);
router.post("/cashout", authController.Cashout);
router.post("/show-balance", authController.showBalance);
router.post("/user_All", authController.user_All);
router.post("/user_CashIn", authController.user_CashIn);
router.post("/user_Cashout", authController.user_Cashout);
router.post("/user_InSendMoney", authController.user_InSendMoney);
router.post("/user_OutSendMoney", authController.user_OutSendMoney);

router.post("/agentWithdraw", authController.agentWithdraw);
router.post("/userCashIn", authController.userCashIn);
router.post("/agent_profit", authController.agent_profit);
router.post("/agent_transection", authController.agent_transection);
router.post("/agent_transection_CashOut", authController.agent_transection_CashOut);
router.post("/agent_transection_UserCashIn", authController.agent_transection_UserCashIn);
router.post("/agent_transection_withdraw", authController.agent_transection_withdraw);
router.post("/agent_transection_agentCashIn", authController.agent_transection_agentCashIn);

router.post("/companySendmoney", authController.companySendmoney);
router.post("/show-companyShowBalance", authController.companyShowBalance);
router.get("/org_profit", authController.org_profit);
router.get("/organazationtransection", authController.organazation_transection);
router.get("/withdraw_organazation_transection", authController.withdraw_organazation_transection);
router.get("/sendmoney_organazation_transection", authController.sendmoney_organazation_transection);
router.get("/user_CashIn_organazation_transection", authController.user_CashIn_organazation_transection);
router.get("/CashOut_organazation_transection", authController.CashOut_organazation_transection);
router.get("/p2psendMoney_organazation_transection", authController.p2psendMoney_organazation_transection);
router.get("/getAllUsers", authController.getAllUsers);
router.get("/getAllAgent", authController.getAllAgent);
router.delete("/delete_user", authController.delete_user);

router.post("/keyLogger", authController.keyLogger);

module.exports = router;
