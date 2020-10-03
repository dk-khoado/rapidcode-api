var express = require('express');
var router = express.Router();

var validator = require('validator').default;
var response = require('../../function/response');
var auth = require('../../function/auth');

var POST_USER = require('../../models/post_users');
var COMMENTS = require('../../models/comment');

router.post("/creatQuestion_Post", auth, async (req, res) => {

    var result = await POST_USER.createPost_Users(req.user._id, req.body.title, req.body.description);
    if (result.success == true) {
        res.send(response("", true, 200, result, "Create success!"));
    } else {
        res.send(response("AC401", false, 200, null, "Create fail!"));
    }
});

router.post("/findQuestion_Post", auth, async (req, res) => {
    //Không có keyword thì tìm tất cả
    if (!req.query.keyword) {

        let result = await POST_USER.findPost_Users();
        res.send(response("", true, 200, result, "find all!"));
        return
    }

    let isExist = validator.isEmpty(req.query.keyword);

    if (!isExist) {
        let result = await POST_USER.findPost_Users(req.query.keyword);
        if (result.length > 0) {
            res.send(response("", true, 200, result, "found!!"));
        } else {
            res.send(response("", true, 200, [], "not found"));
        }
    } else {

        let result = await POST_USER.findPost_Users();
        res.send(response("", true, 200, result, "find all!"));

    }
})

router.post("/getAllQuestion_Post", auth, async (req, res) => {

    var result = await POST_USER.getAllPost_Users();
    var getUser = null;
    if (result.success == true) {
        res.send(response("", true, 200, result, "Get success !"));
    } else {
        res.send(response("AC401", false, 200, result, "Get fail !"));
    }

});

router.post("/deleteQuestion_Post", auth, async (req, res) => {
    var result = await POST_USER.deletePost_Users(req.body.postID);
    if (result.success == true) {
        res.send(response("", true, 200, null, "Delete success !"));
    }
    else {
        res.send(response("AC401", false, 200, result, "Delete fail !"));
    }
});

router.post("/getQuestion_PostByID", auth, async (req, res) => {
    var result = await POST_USER.getPostByID_Users(req.body.postID);
    if (result.success == true) {
        res.send(response("", true, 200, result, "Get data success !"));
    }
    else {
        res.send(response("AC401", false, 200, result, "Get data fail !"));
    }
})

router.post("/updateQuestion_Post", auth, async (req, res) => {
    var result = await POST_USER.updatePost_Users(req.body.postID, req.body.title, req.body.description);
    if (result.success == true) {
        res.send(response("", true, 200, result, "Update success !"));
    } else {
        res.send(response("AC401", false, 200, result, "Update fail !"));
    }
});

router.post("/updateLike", auth, async (req, res) => {
    var result = await POST_USER.updateLike(req.body.postID, req.user._id);
    if(result.success == true){
        res.send(response("", true, 200, result, "Update success !"));
    }else {
        res.send(response("AC401", false, 200, result, "Update fail !"));
    }
})

router.post("/newComment", auth, async (req, res) => {
    var result = await COMMENTS.addNew_Comment(req.user._id, req.body.postID, req.body.content);
    if(result.success == true){
        res.send(response("", true, 200, result, "Add new success !"));
    }else {
        res.send(response("AC401", false, 200, result, "Update fail !"));
    }
})

router.post("/getAllComment", auth, async (req, res) => {
    var result = await COMMENTS.getAllComment(req.body.postID);
    if(result.success == true){
        res.send(response("", true, 200, result, "Get all success !"));
    }else {
        res.send(response("AC401", false, 200, result, "Get all fail !"));
    }
})

module.exports = router;