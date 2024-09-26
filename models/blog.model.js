import mongoose from "mongoose"

// Define the schema for a blog post
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  authorAvatar: {
    type: String,
    default: 'https://example.com/default-avatar.png', // Default avatar URL
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readTime: {
    type: Number, // Duration in minutes
    default: 5,
  },
  views: {
    type: Number,
    default: 0,
  },
  comments: [{
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Comment'
   }],
  likes: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: 'https://example.com/default-image.png', // Default image URL
  },
});

// Create the model
const Post = mongoose.model('posts', blogPostSchema);

export default Post
