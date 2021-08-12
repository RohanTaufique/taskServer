const express = require("express");
const {
      signup,
      verifyUser,
      signin,
      forgotPassword,
      resetPassword,
      newPassword,
      userById,
      requireSignin,
      getUser
} = require("../controllers/auth");
const { userSignupValidator } = require('../validator/auth');

const router = express.Router();

router.post("/signup", userSignupValidator, signup);
router.get("/confirm/:confirmationCode", verifyUser);
router.post('/signin', signin);
router.put('/forgot-password', forgotPassword)
router.get('/reset-password/:resetCode', resetPassword)
router.put('/reset-password/:resetCode',newPassword)
router.get("/authenticate/:userId", requireSignin,getUser);

router.param('userId', userById);
module.exports = router;