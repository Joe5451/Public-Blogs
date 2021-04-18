const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '請輸入匿稱'],
    },
    email: {
        type: String,
        required: [true, '請輸入 Email'],
        unique: true,
        validate: [isEmail, '請輸入有效的 Email'],
    },
    password: {
        type: String,
        required: [true, '請輸入密碼'],
        minlength: [8, '密碼長度最小為 8 碼'],
        maxlength: [16, '密碼長度最大為 16 碼'],
    },
    gender: {
        type: String,
        required: [true, '請選擇性別'],
    }
}, {
    timestamps: true,
});

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({email});

    if (user) {
        const auth = await bcrypt.compare(password, user.password);

        if (auth) {
            return user;
        } else {
            throw Error('不正確的密碼')
        }
    } else {
        throw Error('不正確的 Email')
    }
};

const User = mongoose.model('user', userSchema);
module.exports = User;
