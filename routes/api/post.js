var express = require('express');
var router = express.Router();

var validator = require('validator').default;
var response = require('../../function/response');
var auth = require('../../function/auth');

var POST = require('../../models/post');
const User = require('../../models/users_model');

router.post("/creatPost", auth, async (req, res) => {

    var result = await POST.createPost(req.user._id, req.body.title, req.body.summary, req.body.description, req.body.isPost);
    if (result || result.success != false) {
        res.send(response("", true, 200, result, "Create success!"));
    } else {
        res.send(response("AC401", false, 200, null, "Create fail!"));
    }


});

router.post("/findPost", auth, async (req, res) => {
    //Không có keyword thì tìm tất cả
    if (!req.query.keyword) {

        let result = await POST.findPost();
        res.send(response("", true, 200, result, "find all!"));
        return
    }

    let isExist = validator.isEmpty(req.query.keyword);

    if (!isExist) {

        let result = await POST.findPost(req.query.keyword);
        if (result.length > 0) {
            res.send(response("", true, 200, result, "found!!"));
        } else {
            res.send(response("", true, 200, [], "not found"));
        }
    } else {

        let result = await POST.findPost();
        res.send(response("", true, 200, result, "find all!"));

    }
})

router.post("/getAllPost", auth, async (req, res) => {

    var result = await POST.getAllPost();
    var getUser = null;
    if (result) {
        res.send(response("", true, 200, result, "Get success !"));
    } else {
        res.send(response("AC401", false, 200, result, "Get fail !"));
    }

});

router.post("/deletePost", auth, async (req, res) => {
    var result = await POST.deletePost(req.body.postID);
    if (result) {
        res.send(response("", true, 200, null, "Delete success !"));
    }
    else {
        res.send(response("AC401", false, 200, result, "Delete fail !"));
    }
});

router.post("/revertPost", auth, async (req, res) => {
    var result = await POST.revertPost(req.body.postID);
    if (result) {
        res.send(response("", true, 200, null, "Delete success !"));
    }
    else {
        res.send(response("AC401", false, 200, result, "Delete fail !"));
    }
});

router.post("/getPostByID", auth, async (req, res) => {
    var result = await POST.getPostByID(req.body.postID);
    if (result) {
        res.send(response("", true, 200, result, "Get data success !"));
    }
    else {
        res.send(response("AC401", false, 200, result, "Get data fail !"));
    }
})

router.post("/getPostHasDelete", auth, async (req, res) => {
    var result = await POST.getPostHasDelete();
    var getUser = null;
    if (result) {
        res.send(response("", true, 200, result, "Get data success !"));
    }
    else {
        res.send(response("AC401", false, 200, result, "Get data fail !"));
    }
})


router.post("/updatePost", auth, async (req, res) => {
    var result = await POST.updatePost(req.body.postID, req.body.title, req.body.summary, req.body.description, req.body.isPost);
    if (result || result.success != false) {
        res.send(response("", true, 200, result, "Update success !"));
    } else {
        res.send(response("AC401", false, 200, result, "Update fail !"));
    }
});

router.post("/randomPost", auth, async (req, res) => {
    var result = await POST.randomPost();
    if (result) {
        res.send(response("", true, 200, result, "Get data success !"));
    } else {
        res.send(response("AC401", false, 200, result, "Get data fail !"));
    }
});

module.exports = router;