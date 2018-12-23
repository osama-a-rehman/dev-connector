const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validatePostInput(data) {
  errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!validator.isLength(data.text, { min: 10, max: 3000 })) {
    errors.text = "Post Text must be between 10 and 3000 characters";
  }

  if (validator.isEmpty(data.text)) {
    errors.text = "Post Text field is required";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
