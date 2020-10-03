var mongoose = require('mongoose');
var chatGroupInfo = require('../models/chat_ground_model');
const User = require('./users_model');
var createPrivateKey = require('../function/createPrivateKey');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const postSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    image_post: {
        type: String,
        default: null
    },
    title_post: {
        type: String,
        required: true,
    },
    summary_post: {
        type: String,
        default: ""
    },
    description_post: {
        type: String,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    //true là post, false là bawfi đăng của user
    isPost: {
        type: Boolean,
        default: true
    }
});


postSchema.statics.createPost = async (userID, title, summary, description, isPost) => {
    var postObject = {
        user_id: userID,
        title_post: title,
        summary_post: summary,
        description_post: description,
        isPost: isPost
    }

    if (title == "" || title == null) {
        return { success: false, message: "Title is required", code: "AC601" }
    }

    if (summary == "" || summary == null) {
        return { success: false, message: "Summary is required", code: "AC601" }
    }

    if (description == "" || description == null) {
        return { success: false, message: "Description is required", code: "AC601" }
    }

    var result = await POST.create(postObject);

    if (result) {
        return result;
    }
    return false;
}

postSchema.statics.getAllPost = async () => {
    var result = await POST.find({ isDelete: false }).populate("user_id", "fullName image email gender username birthday").sort({ _id: -1 });
    if (result) {
        var resultData = result.map(function(obj) {
            return {image_post: obj.image_post, summary_post: obj.summary_post, isDelete: obj.isDelete, 
                isPost: obj.isPost, _id: obj._id, user_id: obj.user_id, title_post: obj.title_post, __v: obj.__v};
        });
        return resultData;
    }
    return false;
}

postSchema.statics.deletePost = async (postID) => {
    var result = await POST.findByIdAndUpdate({ _id: postID }, { isDelete: true }, { runValidators: true });
    if (result) {
        return result;
    }
    return false;
}

postSchema.statics.revertPost = async (postID) => {
    var result = await POST.findByIdAndUpdate({ _id: postID }, { isDelete: false }, { runValidators: true });
    if (result) {
        return result;
    }
    return false;
}

postSchema.statics.getPostByID = async (postID) => {
    var result = await POST.find({ _id: postID, isDelete: false }).populate("user_id", "fullName image email gender username birthday");
    if (result) {
        return result;
    }
    return false;
}

postSchema.statics.getPostHasDelete = async () => {
    var result = await POST.find({ isDelete: true });
    if (result) {
        return result;
    }
    return false;
}

postSchema.statics.findPost = async (keyWord) => {
    if (keyWord) {
        return await POST.find(
            { isDelete: false, title_post: { $regex: new RegExp(keyWord, "i") } },
            { title_post: 1, summary_post: 1, image_post: 1, isDelete: 1, isPost: 1, _id: 1 }
        ).populate("user_id");
    }
    return await POST.find(
        { isDelete: false },
        { title_post: 1, summary_post: 1, image_post: 1, isDelete: 1, isPost: 1, _id: 1 }
    ).populate("user_id");
}

postSchema.statics.updatePost = async (postID, title, summary, description, isPost) => {
    var obj = {
        "title_post": title,
        "summary_post": summary,
        "description_post": description,
        "isPost": isPost
    }

    if (title == "" || title == null) {
        return { success: false, message: "Title is required", code: "AC601" }
    }

    if (summary == "" || summary == null) {
        return { success: false, message: "Summary is required", code: "AC601" }
    }

    if (description == "" || description == null) {
        return { success: false, message: "Description is required", code: "AC601" }
    }


    var result = await POST.findByIdAndUpdate({ _id: postID }, obj, { runValidators: true });
    if (result) {
        return obj;
    }

    return false;

}


postSchema.statics.randomPost = async () => {
    var result = await POST.find({ isDelete: false }).populate("user_id", "fullName image email gender username birthday").sort({ _id: -1 });
    var arrayData = [];
    if (result) {
        var resultData = result.map(function(obj) {
            return {image_post: obj.image_post, summary_post: obj.summary_post, isDelete: obj.isDelete, 
                isPost: obj.isPost, _id: obj._id, user_id: obj.user_id, title_post: obj.title_post, __v: obj.__v};
        });

        for(let i = 0; i < resultData.length; i++){
            
            var dataReturn = resultData[Math.floor(Math.random() * resultData.length)];
            arrayData.push(dataReturn);
            if(i > 2){
                break;
            }
        }
        return arrayData;
    }
    
    return false;
}

const POST = mongoose.model('post', postSchema, "post");

module.exports = POST;