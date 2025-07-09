// services/queries.js
const { prisma } = require("../config/client");
const bcrypt = require("bcryptjs");

exports.createUser = async ({ email, password }) => {
  const hash = await bcrypt.hash(password, 12);

  return await prisma.user.create({
    data: {
      email,
      hash,
    },
  });
};

exports.checkForUser = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

exports.checkForUserStorageById = async (userId) => {
  const user = await prisma.userStorage.findUnique({
    where: { userId },
  });
  return user;
};

exports.createUserStorage = async (id) => {
  const userStorage = await prisma.userStorage.create({
    data: {
      user: {
        connect: {
          id,
        },
      },
    },
  });
  return userStorage;
};

exports.createNewFile = async (
  title,
  filename,
  fileType,
  size,
  id,
  folderId
) => {
  const data = {
    title: title,
    url: `${filename}`,
    fileType: fileType,
    size: size,
    storage: { connect: { id } },
  };

  if (folderId !== "00") {
    data.folder = { connect: { id: parseInt(folderId) } };
  }

  await prisma.storedFile.create({ data });
};

exports.checkForFile = async (fileId) => {
  const file = await prisma.storedFile.findUnique({
    where: {
      id: parseInt(fileId),
    },
  });
  return file;
};

exports.getUserFilesAndFolders = async (userId) => {
  const userStorage = await prisma.userStorage.findUnique({
    where: {
      userId,
    },
    include: {
      files: {
        orderBy: {
          createdAt: "desc",
        },
      },
      folders: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });
  return userStorage || { files: [], folders: [] };
};

exports.createNewFolder = async (name, id) => {
  await prisma.folder.create({
    data: {
      name: name,
      storage: {
        connect: { id },
      },
    },
  });
};

exports.getUserFilesWithinFolder = async (folderId) => {
  const files = await prisma.folder.findUnique({
    where: {
      id: parseInt(folderId),
    },
    include: {
      files: true,
    },
  });
  return files;
};

exports.folderUpdateName = async (folderId, newFolderName) => {
  await prisma.folder.update({
    where: {
      id: parseInt(folderId),
    },
    data: {
      name: newFolderName,
    },
  });
};

exports.deleteFolder = async (folderId) => {
  const deletedFolder = await prisma.folder.delete({
    where: {
      id: parseInt(folderId),
    },
  });
  return deletedFolder;
};

exports.deleteFile = async (fileId) => {
  const deletedFile = await prisma.storedFile.delete({
    where: {
      id: parseInt(fileId),
    },
  });
  return deletedFile;
};

exports.editFile = async (fileId, newFileName, newFolderId) => {
  const editedFile = await prisma.storedFile.update({
    where: {
      id: parseInt(fileId),
    },
    data: {
      title: newFileName,
      folderId: newFolderId === "00" ? null : parseInt(newFolderId),
    },
  });
  return editedFile;
};
