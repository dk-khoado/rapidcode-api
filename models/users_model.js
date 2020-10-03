var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var bcrypt = require('bcrypt');
var validator = require('validator').default;
var jwt = require('jsonwebtoken');
var createPrivateKey = require('../function/createPrivateKey');
var createCodeActive = require('../function/createCodeActive');
var base64 = require('js-base64').Base64;

const temp = require('../models/tempForgotPassword');

const Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        validate: /^[A-Za-z0-9_]+$/,
        min: 4
    },
    fullName: {
        type: String,
        default: "Coder",
        min: 1
    },
    password: {
        type: String,
        required: true
    },
    dateCreate: { type: Date, default: Date.now },
    googleID: { type: Number },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: v => {
            if (!validator.default.isEmail(v)) {
                throw Error("Invalid Email address");
            }
        }
    },
    image: { type: String, default: null },
    private_key: {
        type: String,
        index: true,
        unique: true,
        default: () => {
            return createPrivateKey(Date.now());
        }
    },
    active: {
        type: Boolean,
        default: false
    },
    activeCode: {
        type: String,
        default: () => {
            return createCodeActive();
        }
    },
    isForgot: {
        type: Boolean,
        default: false,
    },
    isdelete: {
        type: Boolean,
        default: false,
    },
    birthday: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        default: null
    }
});
userSchema.pre('save', async function (next) {
    var user = this;

    if (user.newpassword) {
        //change password
        user.password = user.newpassword;
        user.newpassword = undefined;
        if (!user.isModified('password')) { return next() };
        await bcrypt.hash(user.password, 10).then((hashedPassword) => {
            user.password = hashedPassword;
            user.private_key = createPrivateKey(Date.now());
            next();
        })
    } else {
        //register
        let username = await User.findOne({ username: this.username });
        let email = await User.findOne({ email: this.email });
        if (username != null) {
            throw { message: 'Username already exist' };
        }
        if (email != null) {
            throw { message: 'Email already exist' };
        }
        if (!user.isModified('password')) { return next() };
        await bcrypt.hash(user.password, 10).then((hashedPassword) => {
            user.password = hashedPassword;
            user.fullName = "Coder " + user.username;
            next();
        })
    }
})

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user    
    var user = this;
    // console.log('[private key]', user.private_key);

    const token = jwt.sign({ _id: user._id, }, user.private_key);
    user.save()
    return token;
}

userSchema.statics.findByCredentials = async (username, email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne(
        {
            $or: [{ email: email }, { username: username }],
            active: true,
        });
    if (!user) {
        return null
    }
    if (user.isdelete) {
        throw "The account has been disabled";
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return null
    }
    return user
}

userSchema.statics.comparePassword = async (id, password) => {
    const user = await User.findOne({ _id: id });
    if (!user) {
        return false;
    }
    let isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return false;
    }
    return true;
}

userSchema.statics.forgotPassword = async (email) => {


    var isExist = await User.exists({ email: email })

    if (isExist) {
        await User.updateOne({ email: email }, { isForgot: true });
        return temp.insertTemp(email);
    }
    return null;
}

userSchema.statics.activeAccount = async (email, code) => {
    var user = await User.findOneAndUpdate({ email: email, activeCode: code, active: false }, { active: true });
    if (user) {
        return true;
    }
    return false;
}

userSchema.statics.findAccount = async (name) => {
    if (name) {
        return await User.find(
            { active: true, isdelete: false, username: { $regex: new RegExp(name, "i") } },
            { username: 1, email: 1, image: 1, fullName: 1 }
        );      
    }
    return await User.find(
        { active: true, isdelete: false },
        { username: 1, email: 1, image: 1, fullName: 1 }
    );

}

userSchema.statics.updateProfile = async (id, mUsername, mFullName, mBirthday, mGender) => {

    var Info = {};


    if (mUsername && mUsername.length >= 4) {
        let username = await User.findOne({ username: mUsername });
        if (username != null) {
            throw { message: "Username has exits !!", code: "AC001" }
        }
        Info.username = mUsername;
    }
    if (mFullName) {
        Info.fullName = mFullName;
    }
    if (mBirthday) {
        Info.birthday = mBirthday;
    }
    if (mGender) {
        Info.gender = mGender;
    }

    var user = await User.findByIdAndUpdate(id, Info);

    if (user) {
        return true;
    }
    return false;
}
const User = mongoose.model('User', userSchema, "users");
module.exports = User;
