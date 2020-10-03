var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userModel = require("../models/users_model");
var randomCode = require('../function/createCodeActive');
var randomKey = require('../function/createRandomKey');
const validator = require('validator').default;
const Schema = mongoose.Schema;

var tempForgotPassword = new Schema({
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
    key: {
        type: String,
        unique: true,
        index: true
    },
    code: {
        type: Number,
        index: true
    },
    expired: {
        type: Date,
        default: new Date() + 1
    }
})

tempForgotPassword.statics.insertTemp = async (email) => {
    var key = randomKey(50);
    var isExist = await temp.exists({ key: key });
    if (isExist) {
        do {
            key = randomKey(50);
            isExist = await temp.exists({ key: key });
        } while (isExist);
    }
    var code = randomCode();
    try {
        var expired = new Date();
        expired.setDate(expired.getDate() + 1);

        return temp.findOneAndUpdate({ email: email },
            { code: code, key: key, expired: expired },
            { upsert: true, new: true });

    } catch (error) {
        console.log(error);
        return null;
    }

}

tempForgotPassword.statics.validateKey = async (key) => {
    var resutl = await temp.findOne({ key: key });
    if (resutl) {
        if (resutl.expired > new Date().getDate()) {
            return resutl.email;
        }
        return null;
    } else {
        return null;
    }
}

const temp = mongoose.model("tempForgotPassword", tempForgotPassword, "temp_ForgotPassword");
module.exports = temp;