// controllers/indexController.js
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { userDataValidate } = require("../validations/userValidation");
const query = require("../services/queries");
const { prisma } = require("../config/client");
const path = require("node:path");

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

function formatFileSize(bytes) {
  if (bytes <= 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1000 * 1000) {
    return `${(bytes / 1000).toFixed(1)} KB`;
  }
  return `${bytes / (1000 * 1000).toFixed(1)} MB`;
}

function formatDate(date) {
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const formatted = date.toLocaleDateString("en-US", options);
  return formatted;
}

exports.homePage = asyncHandler(async (req, res, next) => {
  let userStorage = {};
  let files = {};
  if (req.user) {
    userStorage = await query.getUserFilesAndFolders(req.user.id);
    files = userStorage.files;
    files = files.map((file) => ({
      ...file,
      size: formatFileSize(file.size),
      createdAt: formatDate(file.createdAt),
    }));
  }
  res.render("home", {
    title: "My Files",
    user: req.user,
    messages: req.flash(),
    files: files,
    folders: userStorage.folders,
    selectedFolderId: false,
  });
});

// file upload
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    req.flash("error", "No file uploaded.");
    return res.redirect("/");
  }

  const { originalname, mimetype, filename, size } = req.file;
  let folder = req.body.folderId;
  const userId = req.user.id;

  let userStorage = await query.checkForUserStorageById(userId);

  if (!userStorage) {
    userStorage = await query.createUserStorage(userId);
  }

  console.log(userStorage);

  await query.createNewFile(
    originalname,
    filename,
    mimetype,
    size,
    userStorage.id,
    folder
  );

  req.flash("success", "File uploaded successfully.");
  res.redirect("/");
});

// add new folder
exports.addNewFolder = asyncHandler(async (req, res, next) => {
  const folderName = req.body.folder;
  const userId = req.user.id;
  if (!folderName) {
    req.flash("error", "Folder must have name");
    return res.redirect("/");
  }

  let userStorage = await query.checkForUserStorageById(userId);
  if (!userStorage) {
    throw new CustomNotFoundError("Can not find user storage in database.");
  }

  await query.createNewFolder(folderName, userStorage.id);
  req.flash("success", "Folder successfully created.");
  res.redirect("/");
});

exports.displaySelectedFolderFiles = asyncHandler(async (req, res, next) => {
  const selectedFolderId = req.params.id;
  console.log("selectedFolderId", req.params);
  let folderFiles = await query.getUserFilesWithinFolder(selectedFolderId);
  const userId = req.user.id;
  const userStorage = await query.getUserFilesAndFolders(userId);

  if (!folderFiles) {
    req.flash("error", "Folder not found or inaccessible.");
    return res.redirect("/");
  }

  folderFiles.files = folderFiles.files.map((file) => ({
    ...file,
    size: formatFileSize(file.size),
    createdAt: formatDate(file.createdAt),
  }));

  console.log("folderFiles.files", folderFiles);

  return res.render("home", {
    title: folderFiles.name,
    user: req.user,
    messages: req.flash(),
    files: folderFiles.files,
    folders: userStorage.folders,
    selectedFolderId: selectedFolderId,
  });
});

// folder rename/delete
exports.renameFolder = asyncHandler(async (req, res, next) => {
  const selectedFolderId = req.params.id;
  let newFolderName = req.body.folder?.trim();

  if (!newFolderName) {
    newFolderName = "New Folder";
  }

  const updatedFolderName = await query.folderUpdateName(
    selectedFolderId,
    newFolderName
  );

  console.log(updatedFolderName);
  return res.redirect("/");
});

exports.deleteFolder = asyncHandler(async (req, res, next) => {
  const selectedFolderId = req.params.id;

  const deletedFolder = await query.deleteFolder(selectedFolderId);
  console.log(deletedFolder);
  return res.redirect("/");
});

// file update/delete
exports.fileDelete = asyncHandler(async (req, res, next) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  const userStorage = await query.checkForUserStorageById(userId);

  const file = await query.checkForFile(fileId);
  if (!file) {
    req.flash("error", "No file was found.");
    return res.redirect("/");
  }

  //check that user matches owner of file
  if (userStorage.id !== file.storageId) {
    req.flash("error", "You are not authorized to delete this file.");
    return res.redirect("/");
  }

  const deletedFile = await query.deleteFile(fileId);
  console.log("deleted File", deletedFile);

  return res.redirect("/");
});

exports.fileEditNameAndFolder = asyncHandler(async (req, res, next) => {
  const fileId = req.params.id;
  const userId = req.user.id;
  const fileName = req.body.fileName?.trim();
  const folderId = req.body.folderId;

  const userStorage = await query.checkForUserStorageById(userId);
  const file = await query.checkForFile(fileId);
  if (!file) {
    req.flash("error", "No file was found.");
    return res.redirect("/");
  }

  if (userStorage.id !== file.storageId) {
    req.flash("error", "You are not authorized to edit this file.");
    return res.redirect("/");
  }

  const editedFile = await query.editFile(fileId, fileName, folderId);
  console.log("edited file", editedFile);
  return res.redirect("/");
});

exports.fileDownload = asyncHandler(async (req, res, next) => {
  const fileId = parseInt(req.params.id);
  const userId = req.user.id;

  const fileAndStorageCheck = await checkForFileAndUserStorage(
    fileId,
    userId,
    "download",
    req,
    res
  );
  const filePath = path.join(__dirname, "..", fileAndStorageCheck.file.url);
  console.log(filePath);
  console.log(fileAndStorageCheck);
  res.download(filePath);
});

const checkForFileAndUserStorage = async (fileId, userId, task, req, res) => {
  const userStorage = await query.checkForUserStorageById(userId);
  const file = await query.checkForFile(fileId);

  if (!file) {
    req.flash("error", "No file was found.");
    return res.redirect("/");
  }

  if (userStorage.id !== file.storageId) {
    req.flash("error", `You are not authorized to ${task} this file.`);
    return res.redirect("/");
  }

  return { userStorage, file };
};
