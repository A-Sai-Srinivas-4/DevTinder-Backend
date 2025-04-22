const bcrypt = require("bcrypt"); // For password encryption

const getEncryptedPassword = async (userPassword) => {
  const salt = await bcrypt.genSalt(10);
  // Hash the user's password with the salt generated above
  const hashedPassword = await bcrypt.hash(userPassword, salt);
  return hashedPassword;
};

module.exports = { getEncryptedPassword };
