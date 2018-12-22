const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User Model
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (request, response) =>
  response.json({
    msg: "Users Works"
  })
);

// @route   GET api/users/register
// @desc    Register a User
// @access  Public
router.post("/register", (request, response) => {
  console.log(request.body);

  const { errors, isValid } = validateRegisterInput(request.body);

  if (!isValid) {
    return response.status(400).json(errors);
  }

  User.findOne({
    email: request.body.email
  }).then(user => {
    if (user) {
      errors.email = "Email already exists";

      return response.status(400).json({
        errors
      });
    } else {
      const avatar = gravatar.url(request.body.email, {
        s: "200", // Avatar Size
        r: "pg", // Avatar Rating
        d: "mm" // Default Avatar
      });

      const newUser = new User({
        name: request.body.name,
        email: request.body.email,
        avatar: avatar,
        password: request.body.password
      });

      bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(newUser.password, salt, (error, hash) => {
          if (error) {
            throw error;
          } else {
            newUser.password = hash;
            newUser
              .save()
              .then(user => response.json(user))
              .catch(error => console.log(error));
          }
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    Logs In a User / Returns a JWT Token
// @access  Public
router.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  const { errors, isValid } = validateLoginInput(request.body);

  if (!isValid) {
    return response.status(400).json(errors);
  }

  // Find User by Email
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "No User is registered with this Email";
      return response.status(400).json(errors);
    }

    bcrypt.compare(password, user.password).then(isMatched => {
      if (!isMatched) {
        errors.password = "Incorrect Password";

        return response.status(400).json(errors);
      } else {
        // response.json({ msg: "Success" });
        // User Matched

        const payload = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (error, token) => {
            response.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Returns the Current Logged In User
// @access  Public
router.get(
  "/current",
  passport.authenticate("jwt", {
    session: false
  }),
  (request, response) => {
    response.json({
      id: request.user.id,
      name: request.user.name,
      email: request.user.email
    });
  }
);
module.exports = router;
