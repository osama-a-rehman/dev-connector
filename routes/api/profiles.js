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
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

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

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (requuest, response) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avataar"])
    .then(profiles => {
      if (!profiles) {
        errors.no_profiles = "There are no profiles";
        return response.status(404).json(errors);
      }

      return response.json(profiles);
    })
    .catch(err =>
      response.status(404).json({ no_profiles: "There are no profiles" })
    );
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/handle/:handle", (request, response) => {
  const errors = {};

  Profile.findOne({ handle: request.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.no_profile = "Mo profile exists for this user handle";
        return response.status(404).json(errors);
      }

      return response.json(profile);
    })
    .catch(err => response.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user_id
// @access  Public
router.get("/user/:user_id", (request, response) => {
  const errors = {};

  Profile.findOne({ user: request.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.no_profile = "No profile exists for this user";
        return response.status(404).json(errors);
      }

      return response.json(profile);
    })
    .catch(err =>
      response
        .status(404)
        .json({ no_profile: "No profile exists for this user" })
    );
});

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

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateExperienceInput(request.body);

    if (!isValid) {
      // errors.my_error = "Error from isValid";
      return response.status(400).json(errors);
    }

    Profile.findOne({ user: request.user.id }).then(profile => {
      if (!profile) {
        errors.no_profile = "No profile exist for this user";
        return response.status(404).json(errors);
      }

      const newExperience = {
        title: request.body.title,
        company: request.body.company,
        location: request.body.location,
        from_date: request.body.from_date,
        to_date: request.body.to_date,
        current: request.body.current,
        description: request.body.description
      };

      // Unshift function adds the new object to the beginning of the array
      profile.experience.unshift(newExperience);

      profile.save().then(profile => response.json(profile));
    });
  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateEducationInput(request.body);

    if (!isValid) {
      // errors.my_error = "Error from isValid";
      return response.status(400).json(errors);
    }

    Profile.findOne({ user: request.user.id }).then(profile => {
      if (!profile) {
        errors.no_profile = "No profile exist for this user";
        return response.status(404).json(errors);
      }

      const newEducation = {
        school: request.body.school,
        degree: request.body.degree,
        field_of_study: request.body.field_of_study,
        from_date: request.body.from_date,
        to_date: request.body.to_date,
        current: request.body.current,
        description: request.body.description
      };

      // Unshift function adds the new object to the beginning of the array
      profile.education.unshift(newEducation);

      profile.save().then(profile => response.json(profile));
    });
  }
);

// @route   DELETE api/profile/experience/:experience_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  "/experience/:experience_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOne({ user: request.user.id })
      .then(profile => {
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(request.params.experience_id);

        profile.experience.splice(removeIndex, 1);

        profile.save().then(profile => response.json(profile));
      })
      .catch(err => response.status(404).json(err));
  }
);

// @route   DELETE api/profile/education/:education_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  "/education/:education_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOne({ user: request.user.id })
      .then(profile => {
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(request.params.education_id);

        profile.education.splice(removeIndex, 1);

        profile.save().then(profile => response.json(profile));
      })
      .catch(err => response.status(404).json(err));
  }
);

// @route   DELETE api/profile/
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOneAndRemove({ user: request.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: request.user.id }).then(() => {
          return response.json({ success: true });
        });
      })
      .catch(err => response.status(404).json(err));
  }
);

module.exports = router;
