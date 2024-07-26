import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";
import { generateToken } from "../utils/jwt.js";

const signUp = async ({ email, password, username }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = new User({ email, password, username });
  await user.save();

  const token = generateToken(user._id);

  return token;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  return token;
};

const profile = async ({ userId, bios, profilePicUrl }) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId).select('-password -createdAt -updatedAt');
    if (!user) {
      throw new Error("User not found");
    }
    
    user.bios = bios;
    user.profilePic = profilePicUrl;
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
};

const editProfile = async ({ userId, updatedData, profilePicUrl }) => {
  try {
    const user = await User.findById(userId).select('-password -createdAt -updatedAt');
    if (!user) {
      throw new Error("User not found");
    }

    // Update only the provided fields
    if (updatedData.username) user.username = updatedData.username;
    if (updatedData.bios) user.bios = updatedData.bios;
    if (profilePicUrl) user.profilePic = profilePicUrl;

    await user.save();

    return user;
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};


const getUserById = async (id) => {
  try {
    const user = await User.findById(id).select('-password'); 
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const FollowUser = async (followerId, followeeId) => {
  try {
    if (followerId === followeeId) {
      throw new Error("You cannot follow yourself.");
    }

    const follower = await User.findById(followerId).select('-password -createdAt -updatedAt');
    if (!follower) {
      throw new Error("Follower not found");
    }
    if (!follower.following.includes(followeeId)) {
      follower.following.push(followeeId);
      await follower.save();
    }

    const followee = await User.findById(followeeId).select('-password -createdAt -updatedAt');
    if (!followee) {
      throw new Error("Followee not found");
    }
    if (!followee.followers.includes(followerId)) {
      followee.followers.push(followerId);
      await followee.save();

      // Create a follow notification
      await Notification.createNotification(followeeId, followerId, 'follow');
    }

    return { follower, followee };
  } catch (error) {
    throw new Error(`Failed to follow user: ${error.message}`);
  }
};


 const unFollowUser = async (followerId, followeeId) => {
  try {
    // Remove followee from follower's following list
    const follower = await User.findById(followerId).select('-password -createdAt -updatedAt');
    if (!follower) {
      throw new Error("Follower not found");
    }
    follower.following = follower.following.filter(id => !id.equals(followeeId));
    await follower.save();

    // Remove follower from followee's followers list
    const followee = await User.findById(followeeId).select('-password -createdAt -updatedAt');
    if (!followee) {
      throw new Error("Followee not found");
    }
    followee.followers = followee.followers.filter(id => !id.equals(followerId));
    await followee.save();

    return { follower, followee };
  } catch (error) {
    throw new Error(`Failed to unfollow user: ${error.message}`);
  }
};




export  { signUp, login, profile,editProfile,getUserById,FollowUser,unFollowUser };
