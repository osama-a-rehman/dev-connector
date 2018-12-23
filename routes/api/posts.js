const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const router = express.Router();

// Load Mongoose Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const validatePostInput = require("../../validation/posts");
const validateCommentInput = require("../../validation/comments");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (request, response) =>
  response.json({
    msg: "posts works"
  })
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get("/", (request, response) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      if (!posts) {
        return response.status(404).json({ no_posts: "No posts found" });
      }

      return response.json(posts);
    })
    .catch(err => response.status(404).json({ no_posts: "No posts found" }));
});

// @route   GET api/posts/:post_id
// @desc    Get post by post_id
// @access  Public
router.get("/:post_id", (request, response) => {
  Post.findById(request.params.post_id)
    .then(post => {
      if (!post) {
        return response
          .status(404)
          .json({ no_posts: "No post found with that id" });
      }

      return response.json(post);
    })
    .catch(err =>
      response.status(404).json({ no_posts: "No post found with that id" })
    );
});

// @route   DELETE api/posts/:post_id
// @desc    Delete post by post_id
// @access  Private
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOne({ user: request.user.id }).then(profile => {
      if (!profile) {
        return response
          .status(404)
          .json({ no_profile: "No profile exists for this user" });
      }

      Post.findById(request.params.post_id).then(post => {
        if (!post) {
          return response
            .status(404)
            .json({ no_post: "No post found with that id" });
        }

        if (post.user.toString() !== request.user.id) {
          return response
            .status(401)
            .json({ unauthorized: "User not authorized" });
        }

        // Delete Post
        post
          .remove()
          .then(() => response.json({ success: true }))
          .catch(err =>
            response.status(404).json({ no_post: "No post found with that id" })
          );
      });
    });
  }
);

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validatePostInput(request.body);

    if (!isValid) {
      return response.status(400).json(errors);
    }

    const newPost = new Post({
      user: request.user.id,
      text: request.body.text,
      name: request.body.name,
      avatar: request.body.avatar
    });

    newPost
      .save()
      .then(post => response.json(post))
      .catch(err => response.status(404).json(errors));
  }
);

// @route   POST api/posts/like/:post_id
// @desc    Like a post
// @access  Private
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOne({ user: request.user.id })
      .then(profile => {
        if (!profile) {
          return response
            .status(404)
            .json({ no_profile: "No profile exists for this user" });
        }

        Post.findById(request.params.post_id)
          .then(post => {
            if (!post) {
              return response
                .status(404)
                .json({ no_post: "No post found with that id" });
            }

            if (
              post.likes.filter(
                like => like.user.toString() === request.user.id
              ).length > 0
            ) {
              return response
                .status(404)
                .json({ already_liken: "User already liked this post" });
            }

            // Add Like to this Post
            post.likes.unshift({ user: request.user.id });

            post.save().then(post => response.json(post));
          })
          .catch(err =>
            response.status(404).json({ no_post: "No post found with that id" })
          );
      })
      .catch(err =>
        response
          .status(404)
          .json({ no_profile: "No profile exists for this user" })
      );
  }
);

// @route   POST api/posts/unlike/:post_id
// @desc    Unlike a post
// @access  Private
router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOne({ user: request.user.id })
      .then(profile => {
        if (!profile) {
          return response
            .status(404)
            .json({ no_profile: "No profile exists for this user" });
        }

        Post.findById(request.params.post_id)
          .then(post => {
            if (!post) {
              return response
                .status(404)
                .json({ no_post: "No post found with that id" });
            }

            if (
              post.likes.filter(
                like => like.user.toString() === request.user.id
              ).length === 0
            ) {
              return response
                .status(404)
                .json({ already_liken: "User has not liked this post" });
            }

            // UnLike this Post
            const removeIndex = post.likes
              .map(like => like.user.toString())
              .indexOf(request.user.id);

            post.likes.splice(removeIndex, 1);

            post.save().then(post => response.json(post));
          })
          .catch(err =>
            response.status(404).json({ no_post: "No post found with that id" })
          );
      })
      .catch(err =>
        response
          .status(404)
          .json({ no_profile: "No profile exists for this user" })
      );
  }
);

// @route   POST api/posts/comment/:post_id
// @desc    Comment on a post
// @access  Private
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateCommentInput(request.body);

    if (!isValid) {
      return response.status(400).json(errors);
    }

    Profile.findOne({ user: request.user.id })
      .then(profile => {
        if (!profile) {
          return response
            .status(404)
            .json({ no_profile: "No profile exists for this user" });
        }

        Post.findById(request.params.post_id)
          .then(post => {
            if (!post) {
              return response
                .status(404)
                .json({ no_post: "No post found with that id" });
            }

            const newComment = {
              text: request.body.text,
              name: request.body.name,
              avatar: request.body.avatar,
              user: request.user.id
            };

            // Add Like to this Post
            post.comments.unshift(newComment);

            post.save().then(post => response.json(post));
          })
          .catch(err =>
            response.status(404).json({ no_post: "No post found with that id" })
          );
      })
      .catch(err =>
        response
          .status(404)
          .json({ no_profile: "No profile exists for this user" })
      );
  }
);

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Deletes the comment from the post
// @access  Private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOne({ user: request.user.id })
      .then(profile => {
        if (!profile) {
          return response
            .status(404)
            .json({ no_profile: "No profile exists for this user" });
        }

        Post.findById(request.params.post_id)
          .then(post => {
            if (!post) {
              return response
                .status(404)
                .json({ no_post: "No post found with that id" });
            }

            if (
              post.comments.filter(
                comment => comment._id.toString() === request.params.comment_id
              ).length === 0
            ) {
              return response
                .status(404)
                .json({ no_post: "No comment found with that id" });
            }

            const newComment = {
              text: request.body.text,
              name: request.body.name,
              avatar: request.body.avatar,
              user: request.user.id
            };

            // Delete the comment from this Post
            const removeIndex = post.comments
              .map(comment => comment._id.toString())
              .indexOf(request.params.comment_id);

            post.comments.splice(removeIndex, 1);

            post.save().then(post => response.json(post));
          })
          .catch(err =>
            response.status(404).json({ no_post: "No post found with that id" })
          );
      })
      .catch(err =>
        response
          .status(404)
          .json({ no_profile: "No profile exists for this user" })
      );
  }
);

module.exports = router;
