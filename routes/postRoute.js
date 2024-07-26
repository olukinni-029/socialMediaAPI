import express from "express";
import { dislikePost, likePost, userPost,viewAllPosts,viewComments,replyComment,createComment, feedPosts,editPost,removePost } from "../controller/postController.js";
import { authenticateUserToken } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/multer.js";

const router =express.Router();

router.post('/posts', authenticateUserToken, upload.fields([{ name: 'images' }, { name: 'videos'}]), userPost);
router.put('/posts/:id/like',authenticateUserToken,likePost);
router.put('/posts/:id/dislike',authenticateUserToken,dislikePost);
router.get('/posts',viewAllPosts);
router.put("/posts/:id", authenticateUserToken, editPost);
router.delete("/posts/:id", authenticateUserToken, removePost);
router.post('/:postId/comments',authenticateUserToken,createComment);
router.post('/:postId/comments/:commentId/reply',authenticateUserToken,replyComment);
router.get('/:postId/comments',authenticateUserToken,viewComments);
router.get('/feed', authenticateUserToken, feedPosts);
export default router;