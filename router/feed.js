import feedController from '../controller/feed.js';
import {body} from 'express-validator';
import route  from 'express';
import isAuth from '../middleware/auth.js';

const router = route.Router();

router.get('/posts',isAuth,feedController.getPosts);

router.post('/post',
    [
        body('title').trim().isLength({min:5}),
        body('content').trim().isLength({min:5})
    ],
    isAuth,feedController.createPost);

router.get('/post/:postId',isAuth,feedController.getPostById);

router.put('/post/:postId',
[
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5})
],
isAuth,feedController.updatePost);

router.delete('/post/:postId',isAuth,feedController.deletePost)

router.get('/status',isAuth,feedController.getStatus);
router.patch('/status',isAuth,feedController.updateStatus);
export default router;