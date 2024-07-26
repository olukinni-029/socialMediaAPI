import express from "express";
import { createProfile, followUser, getNotifications, getUserProfile, markNotificationsRead, registerUser, unfollowUser, updateProfile, UserLogin } from "../controller/userController.js";
import { upload } from "../utils/multer.js";
import { authenticateUserToken } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post('/',registerUser);
router.post('/login',UserLogin);
router.post('/profile',upload.single('profilePic'),authenticateUserToken,createProfile);
router.patch('/profile',upload.single('profilePic'),authenticateUserToken,updateProfile);
router.get('/users/:id',authenticateUserToken,getUserProfile);
router.post('/follow/:followeeId', authenticateUserToken, followUser);
router.post('/unfollow/:followeeId', authenticateUserToken, unfollowUser);
router.get('/notification', authenticateUserToken, getNotifications);
router.post('/readNotification', authenticateUserToken, markNotificationsRead);
export default router;