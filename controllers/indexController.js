// controllers/indexController.js
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { userDataValidate } = require("../validations/userValidation");
const query = require("../services/queries");

exports.createAccount = asyncHandler(async (req, res, next) => {
  res.render("create-account", {
    title: "Create Account",
    previousData: {},
    messages: req.flash(),
  });
});

exports.createAccountPost = [
  userDataValidate,
  asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const emailInUse = await query.checkForUser(req.body.email);
    const errors = validationResult(req);
    console.log(errors.array());
    if (emailInUse !== null) {
      req.flash("error", "Email already in use.");
      return res.redirect("create-account");
    }

    if (!errors.isEmpty()) {
      errors.array().forEach((err) => {
        req.flash("error", err.msg);
      });

      return res.status(400).render("create-account", {
        title: "Create account",
        previousData: req.body,
        messages: req.flash(),
        user: req.user,
      });
    }

    const { email, password } = req.body;
    const user = await query.createUser({ email, password });
    console.log(user);
    req.flash("success", "success!");
    res.redirect("login");
  }),
];

exports.homePage = asyncHandler(async (req, res, next) => {
  res.render("home", {
    title: "Your Files",
    user: req.user,
    messages: req.flash(),
  });
});
