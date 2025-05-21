//./routes/indexRouter.js
const { Router } = require("express");
const indexRouter = Router();
const indexController = require("../controllers/indexController");

indexRouter.get("/create-account", indexController.createAccount);
indexRouter.post("/create-account", indexController.createAccountPost);

indexRouter.get("/", indexController.homePage);

module.exports = { indexRouter };
