// validations/userValidation.js
const { body } = require("express-validator");

const userDataValidate = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),

  body("password").notEmpty().withMessage("You must enter a password"),

  body("confirmPassword")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match."),
];

module.exports = { userDataValidate };
