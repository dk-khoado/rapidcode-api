var mongoose = require('mongoose');
var chatGroupInfo = require('../models/chat_ground_model');
const User = require('./users_model');
var createPrivateKey = require('../function/createPrivateKey');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const postQuestionSchemas = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    time_create: {
        type: Date,
        default: Date.now()
    },
    image_post_user: {
        type: String,
        default: null
    },
    title_post_user: {
        type: String,
        required: true,
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    description_post_user: {
        type: String,
        required: true
    },
    like: {
        type: Array
    }
});


postQuestionSchemas.statics.createPost_Users = async (userID, title, description) => {
    var postObject = {
        user_id: userID,
        title_post_user: title,
        description_post_user: description
    }

    if (title == "" || title == null) {
        return { success: false, message: "Title is required", code: "AC601" }
    }

    if (description == "" || description == null) {
        return { success: false, message: "Description is required", code: "AC601" }
    }

    var result = await POST_USER.create(postObject);

    if (result) {
        return { success: true, data: result };
    }
    return { success: false };
}

postQuestionSchemas.statics.getAllPost_Users = async () => {
    var result = await POST_USER.find({ isDelete: false }).populate("user_id", "fullName image email gender username birthday").sort({ _id: -1 });
    if (result) {
        return { success: true, data: result };
    }
    return { success: false };
}

postQuestionSchemas.statics.deletePost_Users = async (postID) => {
    var result = await POST_USER.findByIdAndUpdate({ _id: postID }, { isDelete: true }, { runValidators: true });
    if (result) {
        return { success: true, data: result };
    }
    return { success: false };
}

postQuestionSchemas.statics.getPostByID_Users = async (postID) => {
    var result = await POST_USER.find({ _id: postID, isDelete: false }).populate("user_id", "fullName image email gender username birthday");
    if (result) {
        return { success: true, data: result };
    }
    return { success: false };
}

postQuestionSchemas.statics.findPost_Users = async (keyWord) => {
    if (keyWord) {
        return await POST_USER.find(
            { isDelete: false, title_post_user: { $regex: new RegExp(keyWord, "i") } }
        ).populate("user_id");
    }
    return await POST_USER.find(
        { isDelete: false }
    ).populate("user_id");
}

postQuestionSchemas.statics.updatePost_Users = async (postID, title, description) => {
    var obj = {
        "title_post_user": title,
        "description_post_user": description
    }

    if (title == "" || title == null) {
        return { success: false, message: "Title is required", code: "AC601" }
    }

    if (description == "" || description == null) {
        return { success: false, message: "Description is required", code: "AC601" }
    }

    var result = await POST_USER.findByIdAndUpdate({ _id: postID }, obj, { runValidators: true });
    if (result) {
        return { success: true, data: obj };
    }

    return { success: false };

}

postQuestionSchemas.statics.updateLike = async (postID, idUser) => {
    var numofLike = await POST_USER.findOne({ _id: postID });

    var obj = {
        "like": numofLike.like.concat(idUser)
    }

    var result = await POST_USER.findByIdAndUpdate({ _id: postID }, obj, { runValidators: true });
    if (result) {
        return { success: true, data: obj };
    }

    return { success: false };

}

const POST_USER = mongoose.model('Question_Post', postQuestionSchemas, "Question_Post");

module.exports = POST_USER;