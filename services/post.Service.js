import Notification from "../models/NotificationModel.js";
import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";

const createPost = async({userId,text,imageUrl,videoUrl})=>{
  try{

    const user = await User.findById(userId).select('-password -createdAt -updatedAt');;
    if (!user) {
      throw new Error("User not found");
    }

    const existingPost = await Post.findOne({
      user: userId,
      text: text || null, 
      images: imageUrl || null,
      videos: videoUrl || null, 
    });

    if (existingPost) {
      throw new Error("A similar post already exists");
    }
  
    const postFields = { user: userId };
    if (text) postFields.text = text;
    if (imageUrl) postFields.images = imageUrl;
    if (videoUrl) postFields.videos = videoUrl;

    const post = new Post(postFields);
    await post.save();
    return post;

  }catch(error){
    throw new Error(`Failed to create post: ${error.message}`);
  }

  };

  
   const likePost = async (postId, userId) => {
    try {
      // Find the post by ID
      const post = await Post.findById(postId).select(' -createdAt -updatedAt');;
      if (!post) {
        throw new Error("Post not found");
      }
  
      // Check if the user has already liked the post
      if (post.likes.includes(userId)) {
        throw new Error("User already liked this post");
      }
  
      // Remove the user from dislikes if they had disliked the post
      post.dislikes.pull(userId);
  
      // Add the user to likes
      post.likes.push(userId);
      
      await Notification.createNotification(post.user, userId, 'like', postId);
    

      // Save the post
      await post.save();
  
      return post;
    } catch (error) {
      throw new Error(`Failed to like post: ${error.message}`);
    }
  };
  
  
   const dislikePost = async (postId, userId) => {
    try {
      // Find the post by ID
      const post = await Post.findById(postId).select('-createdAt -updatedAt');;
      if (!post) {
        throw new Error("Post not found");
      }
  
      // Check if the user has already disliked the post
      if (post.dislikes.includes(userId)) {
        throw new Error("User already disliked this post");
      }
  
      // Remove the user from likes if they had liked the post
      post.likes.pull(userId);
  
      // Add the user to dislikes
      post.dislikes.push(userId);
  
      // Save the post
      await post.save();
  
      return post;
    } catch (error) {
      throw new Error(`Failed to dislike post: ${error.message}`);
    }
  };

  const getAllPosts = async ({ page = 1, limit = 10, sort = { createdAt: -1 } } = {}) => {
    try {
      const posts = await Post.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort).select('-password -createdAt -updatedAt');;
  
      const totalPosts = await Post.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);
  
      return {
        posts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: page,
          postsPerPage: limit,
        },
      };
    } catch (error) {
      throw new Error(`Failed to retrieve posts: ${error.message}`);
    }
  };

  const addComment = async (postId, userId, text) => {
    try {
      const post = await Post.findById(postId).select('-createdAt -updatedAt');;
      if (!post) {
        throw new Error("Post not found");
      }
  
      // Add the new comment
      post.comments.push({
        user: userId,
        post: postId,
        text
      });

      await Notification.createNotification(post.user, userId, 'comment', postId, comment._id);

      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  };
  
  const replyToComment = async (postId, commentId, userId, text) => {
    try {
      const post = await Post.findOne({ _id: postId, "comments._id": commentId }).select('-createdAt -updatedAt');;
      if (!post) {
        throw new Error("Post or comment not found");
      }
  
      // Find the comment to reply to
      const comment = post.comments.id(commentId);
      comment.replies.push({
        user: userId,
        text
      });
  
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Failed to reply to comment: ${error.message}`);
    }
  };
  
  const getComments = async (postId) => {
    try {
      const post = await Post.findById(postId).select('comments -createdAt -updatedAt');
      if (!post) {
        throw new Error("Post not found");
      }
      return post.comments;
    } catch (error) {
      throw new Error(`Failed to retrieve comments: ${error.message}`);
    }
  };

  export const getFeedPosts = async (userId) => {
    try {
      // Find the current user and get the list of followed users
      const user = await User.findById(userId).populate('following');
      if (!user) {
        throw new Error("User not found");
      }
  
      const followingIds = user.following.map(followedUser => followedUser._id);
  
      // Find posts from followed users
      const posts = await Post.find({ user: { $in: followingIds } }).sort({ createdAt: -1 });
      return posts;
    } catch (error) {
      throw new Error(`Failed to retrieve feed posts: ${error.message}`);
    }
  };
  
  const updatePost = async (postId, userId, updateData) => {
    try {
      const post = await Post.findOne({ _id: postId, user: userId });
  
      if (!post) {
        throw new Error("Post not found or you are not authorized to edit this post");
      }
  
      if (updateData.text !== undefined) {
        post.text = updateData.text;
      }
  
      if (updateData.imageUrl !== undefined) {
        post.images = updateData.imageUrl;
      }
  
      if (updateData.videoUrl !== undefined) {
        post.videos = updateData.videoUrl;
      }
  
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
  };

   const deletePost = async (postId, userId) => {
    try {
      const post = await Post.findOne({ _id: postId, user: userId });
  
      if (!post) {
        throw new Error("Post not found or you are not authorized to delete this post");
      }
  
      await Post.deleteOne({ _id: postId, user: userId });
      return { message: "Post deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  };
  
  
  export  {createPost,likePost,dislikePost,getAllPosts,addComment,replyToComment,getComments,updatePost,deletePost};


  const createNotification = async (recipientId, senderId, type, postId = null, commentId = null) => {
     try {
       const notification = new Notification({
         recipient: recipientId,
         sender: senderId,
         type,
         post: postId,
         comment: commentId
       });
       await notification.save();
       return notification;
     } catch (error) {
       throw new Error(`Failed to create notification: ${error.message}`);
     }
   };

   export default{createNotification};