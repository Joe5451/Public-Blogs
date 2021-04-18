const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const {requireAuth} = require('../middlewares/blogMiddlewares');

// see all blogs
router.get('/blogs', blogController.blogs_get);

// see specific blog
router.get('/blogs/:id', blogController.specific_blog_get);

// signup user page
router.get('/signup', blogController.signup_get);

// login user page
router.get('/login', blogController.login_get);

// create a blog
router.get('/po-blog', requireAuth, blogController.po_blog_get);

// see my blogs
router.get('/my-blogs', requireAuth, blogController.my_blogs_get);

// edit a blog
router.get('/edit-blog/:id', requireAuth, blogController.edit_blog_get);

// put '/edit-blog' request
router.put('/edit-blog/:id', blogController.edit_blog_put);

// delete '/edit-blog' request
router.delete('/edit-blog/:id', blogController.edit_blog_delete);

// logout user
router.get('/logout', blogController.logout_get);

// web notices
router.get('/notices', blogController.notices_get);

// post 'signup user' request
router.post('/signup', blogController.signup_post);

// post 'login user' request
router.post('/login', blogController.login_post);

// post 'create a blog' request
router.post('/po-blog', blogController.po_blog_post);

// put 'update blog' request
router.put('/blogs/:id', );

// delete 'delete a blog' request
router.delete('/blogs/:id', );

// get message
router.post('/get-message/:id', blogController.get_message);

// leave message
router.post('/leave-message/:id', requireAuth, blogController.leave_message);

module.exports = router;