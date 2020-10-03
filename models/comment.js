var mongoose = require('mongoose');
var chatGroupInfo = require('../models/chat_ground_model');
const User = require('./users_model');
var createPrivateKey = require('../function/createPrivateKey');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;
6
const commentSchemas = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    postID: {
        type: String,
        required: true
    },
    contents: {
        type: String,
        default: null
    },
    timeCreated: {
        type: Date,
        default: Date.now()
    }
});


commentSchemas.statics.addNew_Comment = async (userID, postID, contents) => {
    var postObject = {
        user_id: userID,
        postID: postID,
        contents: contents
    }

    var result = await COMMENTS.create(postObject);

    if (result) {
        return { success: true, data: result };
    }
    return { success: false };
}

commentSchemas.statics.getAllComment = async (postID) => {
    var result = await COMMENTS.find({postID: postID}).populate("user_id", "fullName image email gender username birthday").sort({ _id: -1 });;

    if (result) {
        return { success: true, data: result };
    }
    return { success: false };
}

const COMMENTS = mongoose.model('Comments', commentSchemas, "Comments");

module.exports = COMMENTS;