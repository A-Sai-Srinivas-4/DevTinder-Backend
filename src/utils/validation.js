const validator = require("validator");
const bcrypt = require("bcrypt");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName || !emailId || !password) {
    throw new Error("All fields are required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Weak password");
  }
};

const validateProfileData = (req) => {
  const allowedUpdateFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "skills",
  ];

  const isUpdateAllowed = Object.keys(req.body).every((key) =>
    allowedUpdateFields.includes(key)
  );

  return isUpdateAllowed;
};

const validateProfilePassword = (req) => {
  const { newPassword } = req.body;
  const user = req.user;
  const isMatchedPassword = bcrypt.compareSync(newPassword, user.password);
  if (isMatchedPassword) {
    throw new Error("Password cannot be same as old password please update new password");
  }
  const isValidProfilePassword = validator.isStrongPassword(newPassword);
  return isValidProfilePassword;
};



module.exports = {
  validateSignUpData,
  validateProfileData,
  validateProfilePassword,
};
