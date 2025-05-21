const CustomNotFoundError = require("../errors/CustomNotFoundError");
const asyncHandler = require("express-async-handler");
const query = require("../services/queries");
const passport = require("passport");

exports.loginPage = asyncHandler(async (req, res, next) => {
  res.render("login", {
    title: "Login",
    user: req.user,
    messages: req.flash(),
  });
});

exports.logInSubmit = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }

    if (!user) {
      req.flash("error", info.message || "Invalid username or password.");
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log("success");
      return res.redirect("/");
    });
  })(req, res, next);
});
