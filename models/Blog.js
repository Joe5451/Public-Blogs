const mongoose = require('mongoose');

const message = new mongoose.Schema({
    author: {type: String, required: true},
    body: {type: String, required: true},
}, {
    timestamps: true,
})

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    author: {type: String, required: true},
    message: [message],
}, {
    timestamps: true,
});

const Blog = mongoose.model('blog', blogSchema);
module.exports = Blog;
