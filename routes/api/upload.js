var express = require('express');
var router = express.Router();
var auth = require('../../function/auth');
var cloudinary = require('cloudinary').v2;
var formidable = require('formidable');
var response = require('../../function/response');
var fs = require('fs');
var isImage = require('is-image');
//const POST = require('../../models/post');
const User = require('../../models/users_model');
const POST = require('../../models/post');
const POST_USER = require('../../models/post_users');

cloudinary.config({
    cloud_name: "ezcode",
    api_key: "536825832552152",
    api_secret: "nJXvwqHs0ulVUhlWDii9MWASOHc"
})

router.post('/uploadAvatar', auth, async (req, res) => {
    if (req.files.avatar.tempFilePath !== null || req.files.avatar.tempFilePath !== "" && isImage(req.files.avatar.tempFilePath)) {
        var getURL = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, { public_id: req.user._id, overwrite: true, folder: "/avatar" });
        var save = await User.findOneAndUpdate({_id: req.user._id},{image: getURL.secure_url},{runValidators:true});
        if(save){
            res.status(200).send(response("", true, 200, getURL, "Upload image success !!!"));
        }
    }else{
        res.send("Không tìm thấy file !!!")
    }
})

router.post('/uploadImagePost/:postID', auth, async (req, res) => {
    var post_id = req.params.postID;
    if (req.files.avatar.tempFilePath !== null || req.files.avatar.tempFilePath !== "" && isImage(req.files.avatar.tempFilePath)) {
        var getURL = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, { public_id: post_id, overwrite: true, folder: "/post" });
        var save = await POST.findOneAndUpdate({_id: post_id},{image_post: getURL.secure_url},{runValidators:true});
        if(save){
            res.status(200).send(response("", true, 200, getURL, "Upload image success !!!"));
        }
    }else{
        res.send("Không tìm thấy file !!!")
    }
})

router.post('/uploadImageQuestion/:postID', auth, async (req, res) => {
    var question_id = req.params.postID;
    if (req.files.avatar.tempFilePath !== null || req.files.avatar.tempFilePath !== "" && isImage(req.files.avatar.tempFilePath)) {
        var getURL = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, { public_id: question_id, overwrite: true, folder: "/question" });
        var save = await POST_USER.findOneAndUpdate({_id: question_id},{image_post_user: getURL.secure_url},{runValidators:true});
        if(save){
            res.status(200).send(response("", true, 200, getURL, "Upload image success !!!"));
        }
    }else{
        res.send("Không tìm thấy file !!!")
    }
})


router.post('/uploadSummernote', auth, async (req, res) => {
    if (req.files.avatar.tempFilePath !== null || req.files.avatar.tempFilePath !== "" && isImage(req.files.avatar.tempFilePath)) {
        var getURL = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, { public_id: req.user._id + new Date().getTime().toString(), overwrite: true, folder: "/summmernote" });      
        res.status(200).send(response("", true, 200, getURL, "Upload image success !!!"));       
    }else{
        res.send("Không tìm thấy file !!!")
    }
})

module.exports = router;