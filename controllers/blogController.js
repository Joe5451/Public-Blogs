const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Blog = require('../models/Blog');

function createToken(id) {
    return jwt.sign({id}, 'public_blogs_secret_key', {
        expiresIn: 60*60*24, // 一天時間
    })
}

function handlerErrors(err) {
    console.log(err.message, err.code);
    const errors = { email: '', password: '', name: '', gender: '' };

    if (err.code === 11000) {
        errors.email = '已存在的 Email';
    }

    if (err.message.includes('user validation failed') && err.code === undefined) {
        // console.log(err.errors);

        Object.values(err.errors).forEach(error => {
            errors[error.properties.path] = error.properties.message;
        })

        // console.log(errors);
    }

    if (err.message === '不正確的 Email') {
        errors.email = err.message;
    }

    if (err.message === '不正確的密碼') {
        errors.password = err.message;
    }

    return errors;
}

const blogs_get = async (req, res, next) => {
    const blogs = Object.values(Object.assign({}, await Blog.find().sort({createdAt: -1})));

    for (let index in blogs) {
        const author = await User.findById(blogs[index].author);
        const name = author.name;
        const email = author.email;
        const gender = author.gender;

        blogs[index].author = name;
        blogs[index].author_email = email;
        blogs[index].author_gender = gender;
    }

    res.render('blogs', {title: 'Public Blogs', blogs});
};

const specific_blog_get = async (req, res, next) => {
    const id = req.params.id;

    const blog = await Blog.findById(id);
    const author = await User.findById(blog.author);

    blog.author = author.name;
    blog.author_gender = author.gender;
    blog.author_email = author.email;

    res.render('specific-blog', {title: `Public Blogs | ${blog.title}`, blog});
};

const login_get = (req, res, next) => {
    res.render('login', {title: 'Public Blogs | 登入'});
};

const login_post = async (req, res, next) => {
    const {email, password} = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);

        res.cookie('jwt-token', token, {maxAge: 1000*60*60*24, httpOnly: true});
        res.json({user: token});
    }
    catch (err) {
        const errors = handlerErrors(err);
        res.status(400).json({errors});
    }
}

const logout_get = (req, res, next) => {
    res.cookie('jwt-token', '',{maxAge: 1});
    res.redirect('/');
}

const signup_get = (req, res, next) => {
    res.render('signup', {title: 'Public Blogs | 註冊'});
};

const signup_post = async(req, res, next) => {
    const {name, email, password, gender} = req.body;
    // console.log(name, email, password, gender);

    await User.init();

    try {
        const user = await User.create({name, email, password, gender});
        res.json({user});
    }
    catch (err) {
        const errors = handlerErrors(err);
        res.status(400).json({errors});
    }
    
};

const po_blog_get = (req, res, next) => {
    res.render('po-blog', {title: 'Public Blogs | po文'});
};

const po_blog_post = async (req, res, next) => {
    const {title, body} = req.body;
    const token = req.cookies['jwt-token'];
    let token_id = "";
    jwt.verify(token, 'public_blogs_secret_key', (err, decodedToken) => {
        if (err) {
            return;
        } else {
            token_id = decodedToken.id;
        }
    });

    const author = token_id;
    const blog = await Blog.create({title, body, author});

    res.json({blog});
};

const my_blogs_get = (req, res, next) => {
    const token = req.cookies['jwt-token'];

    if (token) {
        jwt.verify(token, 'public_blogs_secret_key', async (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                const blogs = await Blog.find({author: decodedToken.id}).sort({createdAt: -1});
                const author = await User.findById(decodedToken.id);
                res.render('my-blogs', {title: 'Public Blogs | 我的 blogs', blogs, author});
            }
        })
    } else {
        res.redirect('/login');
    }
};

const edit_blog_get = async (req, res, next) => {
    const blog_id = req.params.id;
    const blog = await Blog.findById(blog_id);
    const token = req.cookies['jwt-token'];
    let author_id = "";

    if (token) {
        jwt.verify(token, 'public_blogs_secret_key', (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                author_id = decodedToken.id;
            }
        });
    }

    if (blog !== null && author_id === blog.author) {
        res.render('edit-blog', {title: `Public Blogs | ${blog.title}`, blog});
    } else {
        res.send('非該 blog 擁有者');
    }

};

const edit_blog_put = async (req, res, next) => {
    const blog_id = req.params.id;
    const {title, body} = req.body;
    await Blog.findByIdAndUpdate(blog_id, {title, body}, {new: true});

    res.send('變更成功');
};

const edit_blog_delete = async (req, res, next) => {
    const blog_id = req.params.id;

    await Blog.findByIdAndDelete(blog_id);
    res.send('刪除成功');
};

const get_message = async (req, res, next) => {
    const blog_id = req.params.id;
    const message = [];

    const blog = await Blog.findById(blog_id);
    if (blog.message.length > 0) {
        for (let msgIndex in blog.message) {
            const msg_author = await User.findById(blog.message[msgIndex].author);
            message.push({
                body: blog.message[msgIndex].body,
                author: msg_author.name,
                gender: msg_author.gender,
                email: msg_author.email,
            })
        }
    }

    res.json({message});
};

const leave_message = async (req, res, next) => {
    const id = req.params.id;
    const message = req.body;
    message.author = res.locals.user._id;

    // 更新文章的 message
    try {
        const blog = await Blog.findById(id);
        const msg_author = await User.findById(message.author);

        await blog.message.push(message);
        await blog.save();
        
        // res.json({blog});
        res.json({message: {
            body: message.body,
            author: msg_author.name,
            gender: msg_author.gender,
            email: msg_author.email,
        }});
    } catch (err) {
        console.log(err.message, err.code);
        
        if (err.message.includes("Cannot read property 'message' of null") && (err.code == undefined)) {
            console.log('找不到該 Id 的文章!');

            res.json({errors: '找不到該 Id 的文章!'});
        }

        if (err.message.includes("Path `body` is required.") && (err.code == undefined)) {
            res.json({errors: '留言不能空白!'});
        }
    }
};

const notices_get = (req, res, next) => {
    res.render('notices', {title: 'Public Blogs | 注意事項'});
};

module.exports = {
    blogs_get,
    specific_blog_get,
    login_get,
    signup_get,
    signup_post,
    notices_get,
    login_post,
    logout_get,
    po_blog_get,
    po_blog_post,
    my_blogs_get,
    edit_blog_get,
    edit_blog_put,
    edit_blog_delete,
    get_message,
    leave_message,
}