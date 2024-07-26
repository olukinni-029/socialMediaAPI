import Notification from "../models/NotificationModel.js";
import * as userService from "../services/user.Service.js"
import cloudinary from "../utils/clodinary.js";
import { editSchema, loginSchema, profileSchema, signUpSchema } from "../utils/validator.js";

// Users can create an account by providing a username, email, and password

export const registerUser = async (req, res) => {
    // Validate request body against signUpSchema
    const { error, value } = signUpSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({success: false, message: error.details.map(detail => detail.message) });
    }
    const { email, password, username } = req.body;
  
    try {
      const token = await userService.signUp({ email, password, username });
      res.status(201).json({success: true,message: 'User signed up successfully', data: value, token });
    } catch (error) {
      res.status(400).json({success: false, message: error.message });
    }
  };


// Users can log in using their email and password.
export const UserLogin = async (req, res) => {
    // Validate request body against loginSchema
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({success: false, message: error.details.map(detail => detail.message) });
  }
    const { email, password} = req.body;
  
    try {
      const token = await userService.login({ email, password });
      res.status(200).json({success: true, token });
    } catch (error) {
      res.status(400).json({success: false, message: error.message });
    }
  };

// Users can create and update their profile information
export const createProfile = async (req, res) => {
  try {
    // Validate the request body against the profile schema
    const { error } = profileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({success: false, message: error.details[0].message });
    }

    
    const { bios } = req.body;
    const profilePic = req.file;
    const userId = req.user.id; 
    
    // Ensure an profilePic file is uploaded
    if (!profilePic) {
      return res.status(400).json({ success: false,message: 'profilePic file is required' });
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });

    const profilePicUrl = result.secure_url;
    
    // Call service function to create profile
    const profileData = await userService.profile({ userId, bios, profilePicUrl });

    // Return success response with profile data
    return res.status(200).json({success: true, message: 'Profile created successfully', profileData });
  } catch (error) {
    return res.status(500).json({success: false, message: 'Failed to create profile', error: error.message });
  }
};

// edit the profile
export const updateProfile = async (req, res) => {
  try {
    const { error } = editSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updatedData = req.body;
    const userId = req.user.id;
    const profilePic = req.file;

    let profilePicUrl;
    if (profilePic) {
      const result = await cloudinary.uploader.upload(profilePic.path, { resource_type: "image" });
      profilePicUrl = result.secure_url;
    }

    const user = await userService.editProfile({ userId, updatedData, profilePicUrl });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// User can view others profiles
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id; 
    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Users can follow and unfollow other users.
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followeeId } = req.params;

    const result = await userService.FollowUser(followerId, followeeId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to follow user', error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followeeId } = req.params;

    const result = await userService.unFollowUser(followerId, followeeId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unfollow user', error: error.message });
  }
};



//Users receive notifications for likes, comments, and follows
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).populate('sender').populate('post').populate('comment');
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message });
  }
};

// Mark notifications as read
export const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read', error: error.message });
  }
};