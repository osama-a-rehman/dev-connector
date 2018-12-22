const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validatorExperienceInput(data) {
  errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from_date = !isEmpty(data.from_date) ? data.from_date : "";

  if (validator.isEmpty(data.title)) {
    errors.title = "Job Title field is required";
  }

  if (validator.isEmpty(data.company)) {
    errors.company = "Company field is required";
  }

  if (validator.isEmpty(data.from_date)) {
    errors.from_date = "From date field is required";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
