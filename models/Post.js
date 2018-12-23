const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users" // This should be equal to name as in mongoose.model(<name>, UserSchema)
  },

  text: {
    type: String,
    required: true
  },

  name: {
    type: String
  },

  avatar: {
    type: String
  },

  date: {
    type: Date,
    default: Date.now
  },

  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users" // This should be equal to name as in mongoose.model(<name>, UserSchema)
      }
    }
  ],

  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users" // This should be equal to name as in mongoose.model(<name>, UserSchema)
      },

      text: {
        type: String,
        required: true
      },

      name: {
        type: String
      },

      avatar: {
        type: String
      },

      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = Post = mongoose.model("posts", PostSchema);
