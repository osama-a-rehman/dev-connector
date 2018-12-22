const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
// const passport = require("../../config/keys");

// Load Profile Model
const Profile = require("../../models/Profile");

// Load User Model
const User = require("../../models/User");

const validateProfileInput = require("../../validation/profile");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (request, response) =>
  response.json({
    msg: "Profiles works"
  })
);

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const errors = {};

    Profile.findOne({ user: request.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.no_profile = "There is no profile for this user";
          return response.status(404).json(errors);
        }

        return response.json(profile);
      })
      .catch(err => {
        return response.status(404).json(err);
      });
  }
);

// @route   POST api/profile
// @desc    Create or Update User Profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateProfileInput(request.body);

    if (!isValid) {
      // errors.my_error = "Error from isValid";
      return response.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = request.user.id;

    if (request.body.handle) profileFields.handle = request.body.handle;
    if (request.body.company) profileFields.company = request.body.company;
    if (request.body.website) profileFields.website = request.body.website;
    if (request.body.location) profileFields.location = request.body.location;
    if (request.body.status) profileFields.status = request.body.status;

    // Logic for Skills
    if (typeof request.body.skills !== "undefined") {
      profileFields.skills = request.body.skills.split(",");
    }

    if (request.body.bio) profileFields.bio = request.body.bio;
    if (request.body.github_username)
      profileFields.github_username = request.body.github_username;

    // Socials
    profileFields.social = {};
    if (request.body.facebook)
      profileFields.social.facebook = request.body.facebook;
    if (request.body.twitter)
      profileFields.social.twitter = request.body.twitter;
    if (request.body.youtube)
      profileFields.social.youtube = request.body.youtube;
    if (request.body.linked_in)
      profileFields.social.linked_in = request.body.linked_in;
    if (request.body.instagram)
      profileFields.social.instagram = request.body.instagram;

    Profile.findOne({ user: request.user.id }).then(profile => {
      if (profile) {
        // Profile exists so update the profile

        Profile.findOneAndUpdate(
          { user: request.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => {
          response.json(profile);
        });
      } else {
        // Profile doesn't exist so create the profile

        // Check if Handle Exists

        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "Handle already exists";
            return response.status(400).json(errors);
          }

          new Profile(profileFields)
            .save()
            .then(profile => response.json(profile))
            .catch(err => response.status(400).json(err));
        });
      }
    });
  }
);
module.exports = router;
