const bcrypt = require('bcrypt');

const saltRounds = 10;

const encryptPass = async (password) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const comparePass = async (password, hashedPassword) => {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
};

module.exports = {
  encryptPass,
  comparePass,
};
