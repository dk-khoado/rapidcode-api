var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var createPrivateKey = require('../function/createPrivateKey');
const temp = require('../models/tempForgotPassword');
var userSchema = require('./schema/user_model')

const CryptoHelper = require('../helpers/CryptoHelper')

userSchema.pre('save', async function(next) {
    var user = this;
    try {
        if (user.newpassword) {
            //change password
            user.password = user.newpassword;
            user.newpassword = undefined;
            if (!user.isModified('password')) { return next() };

            var result = CryptoHelper.hash(user.password)
            user.password = result.hashed_password;
            user.private_key = createPrivateKey(Date.now());
            user.salt = result.salt
            next();
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

            var result = CryptoHelper.hash(user.password)
            user.password = result.hashed_password;
            user.private_key = createPrivateKey(Date.now());
            user.salt = result.salt
            user.fullName = user.username;
            next();
        }
    } catch (error) {
        console.error(error)
    }
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user    
    var user = this;
    // console.log('[private key]', user.private_key);

    const token = jwt.sign({ _id: user._id, }, user.private_key);
    return token;
}

userSchema.statics.findByCredentials = async(username, email, password) => {
    try {
        // Search for a user by email and password.
        const user = await User.findOne({
            $or: [{ email: email }, { username: username }],
            active: true,
        });
        if (!user) {
            return null
        }
        if (user.isdelete) {
            throw "The account has been disabled";
        }
        if (user.salt) {
            var result = CryptoHelper.check(password, user.salt, user.password)
            if (result) {
                return user
            }
            return null
        }
        //sẽ bị bỏ sau khi release
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return null
        }
        var resultHash = CryptoHelper.hash(password)
        user.password = resultHash.hashed_password;
        user.salt = resultHash.salt;
        await user.save()
        return user
    } catch (error) {
        return null;
    }

}

userSchema.statics.comparePassword = async(id, password) => {
    try {
        const user = await User.findOne({ _id: id });
        if (!user) {
            return false;
        }
        if (user.salt) {
            var result = CryptoHelper.check(password, user.salt, user.password)
            if (result) {
                return user
            }
            return null
        }
        //sẽ bị bỏ sau khi release
        let isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return false;
        }
        return true;
    } catch (error) {
        return false
    }

}

userSchema.statics.forgotPassword = async(email) => {


    var isExist = await User.exists({ email: email })

    if (isExist) {
        await User.updateOne({ email: email }, { isForgot: true });
        return temp.insertTemp(email);
    }
    return null;
}

userSchema.statics.activeAccount = async(email, code) => {
    var user = await User.findOneAndUpdate({ email: email, activeCode: code, active: false }, { active: true });
    if (user) {
        return true;
    }
    return false;
}

userSchema.statics.findAccount = async(name) => {
    if (name) {
        return await User.find({ active: true, isdelete: false, username: { $regex: new RegExp(name, "i") } }, { username: 1, email: 1, image: 1, fullName: 1 });
    }
    return await User.find({ active: true, isdelete: false }, { username: 1, email: 1, image: 1, fullName: 1 });

}

userSchema.statics.updateProfile = async(id, mUsername, mFullName, mBirthday, mGender) => {

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