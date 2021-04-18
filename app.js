const express = require('express');
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const blogRoutes = require('./routes/blogRoutes');
const {checkUser} = require('./middlewares/blogMiddlewares');
const app = express();

const dbURI = '...';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => {
    app.listen(PORT);
    console.log('successful!');
})
.catch((err) => {
    console.log(err);
});

app.set('view engine', 'ejs');

// app.use(express.urlencoded( { extended: true })); 
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    // 永不緩存頁面
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
})

app.get('*', checkUser);
app.get('/', (req, res) => {
    res.redirect('/blogs');
})

app.use(blogRoutes);
