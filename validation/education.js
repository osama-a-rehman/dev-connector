const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validatorEducationInput(data) {
  errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.field_of_study = !isEmpty(data.field_of_study)
    ? data.field_of_study
    : "";
  data.from_date = !isEmpty(data.from_date) ? data.from_date : "";

  if (validator.isEmpty(data.school)) {
    errors.school = "School field is required";
  }

  if (validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is required";
  }

  if (validator.isEmpty(data.field_of_study)) {
    errors.field_of_study = "Field of study date field is required";
  }

  if (validator.isEmpty(data.from_date)) {
    errors.from_date = "From date field is required";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
