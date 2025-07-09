//./routes/indexRouter.js
const { Router } = require("express");
const indexRouter = Router();
const indexController = require("../controllers/indexController");
const upload = require("../multer");

indexRouter.get("/create-account", indexController.createAccount);
indexRouter.post("/create-account", indexController.createAccountPost);

const checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  if (req.originalUrl === "/") {
    return res.redirect("/login");
  }

  req.flash("error", "You must login first to upload a file.");
  res.redirect("/login");
};

indexRouter.post(
  "/upload",
  checkAuthentication,
  upload.single("file"),
  indexController.uploadFile
);

indexRouter.post(
  "/create-folder",
  checkAuthentication,
  indexController.addNewFolder
);

indexRouter.get("/folder/:id", indexController.displaySelectedFolderFiles);

indexRouter.post("/rename-folder/:id", indexController.renameFolder);
indexRouter.post("/delete-folder/:id", indexController.deleteFolder);

indexRouter.post(
  "/edit-file/:id",
  upload.none(),
  indexController.fileEditNameAndFolder
);
indexRouter.post(
  "/delete-file/:id",
  checkAuthentication,
  indexController.fileDelete
);
indexRouter.get("/file/download/:id", indexController.fileDownload);

indexRouter.get("/", checkAuthentication, indexController.homePage);

module.exports = { indexRouter };
