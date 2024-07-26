import * as postService from "../services/post.Service.js"
import cloudinary from "../utils/clodinary.js";
import { postSchema } from "../utils/validator.js";
import Media from "../models/MediaModel.js"
import { generateFileHash } from "../utils/hash.js";
//Users can create a new post with text, images, or videos.
export const userPost = async (req, res) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { text } = req.body;
    const userId = req.user.id;
    const files = req.files;

    let imageUrl, videoUrl;

    // Handle image upload
    if (files && files.images && files.images[0]) {
      const imageFile = files.images[0];
      const imageHash = await generateFileHash(imageFile.path);

      let existingImage = await Media.findOne({ hash: imageHash }).exec();
      if (!existingImage) {
        const imageResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image"
        });
        imageUrl = imageResult.secure_url;

        existingImage = new Media({
          hash: imageHash,
          url: imageUrl,
          size: imageFile.size,
          type: imageFile.mimetype
        });

        // Use save() method to handle concurrency
        await existingImage.save();
      } else {
        imageUrl = existingImage.url;
      }
    }

    // Handle video upload
    if (files && files.videos && files.videos[0]) {
      const videoFile = files.videos[0];
      const videoHash = await generateFileHash(videoFile.path);

      let existingVideo = await Media.findOne({ hash: videoHash }).exec();
      if (!existingVideo) {
        const videoResult = await cloudinary.uploader.upload(videoFile.path, {
          resource_type: "video"
        });
        videoUrl = videoResult.secure_url;

        existingVideo = new Media({
          hash: videoHash,
          url: videoUrl,
          size: videoFile.size,
          type: videoFile.mimetype
        });

        // Use save() method to handle concurrency
        await existingVideo.save();
      } else {
        videoUrl = existingVideo.url;
      }
    }

    const newPost = await postService.createPost({
      text,
      userId,
      imageUrl,
      videoUrl,
    });

    res.status(201).json({ success: true, newPost });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
  }
};


export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const updatedPost = await postService.likePost(postId, userId);
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to like post', error: error.message });
  }
};

// Dislike a post
export const dislikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const updatedPost = await postService.dislikePost(postId, userId);
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to dislike post', error: error.message });
  }
};

// Users can view posts from other users.
export const viewAllPosts = async (req,res)=>{
  try {
    const { page = 1, limit = 10, sort } = req.query;

    // Convert sort query parameter to object if needed
    const sortCriteria = sort ? JSON.parse(sort) : { createdAt: -1 };

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortCriteria,
    };

    const result = await postService.getAllPosts(options);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve posts', error: error.message });

  }
}

// Users can comment on posts.
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const updatedPost = await postService.addComment(postId, userId, text);
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add comment', error: error.message });
  }
};

// Reply to a comment
export const replyComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const updatedPost = await postService.replyToComment(postId, commentId, userId, text);
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reply to comment', error: error.message });
  }
};

// View comments of a post
export const viewComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await postService.getComments(postId);
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve comments', error: error.message });
  }
};
// Users can edit their own posts.
export const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    const updatedPost = await postService.updatePost(postId, userId, updateData);

    res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update post', error: error.message });
  }
};

// Users can delete their own posts.
export const removePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const result = await postService.deletePost(postId, userId);

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete post', error: error.message });
  }
};


//Users can view a feed of posts from users they follow
export const feedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await postService.getFeedPosts(userId);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve feed posts', error: error.message });
  }
};