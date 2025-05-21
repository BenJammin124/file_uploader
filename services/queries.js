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
  console.log(email);

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  console.log(user);
  return user;
};
