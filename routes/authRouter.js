//./routes/authRouters.js
const { Router } = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");

authRouter.get("/login", authController.loginPage);
authRouter.post("/login", authController.logInSubmit);
authRouter.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect("login");
  });
});

module.exports = { authRouter };
