var express = require('express');
var router = express.Router();

var friendsModel = require('../../models/friends_model');
var userModel = require('../../models/users_model');

var validator = require('validator').default;
var response = require('../../function/response');
var auth = require('../../function/auth');

//query: name
router.get("/find", async (req, res) => {

    if (!req.query.name) {

        let result = await userModel.findAccount();
        res.send(response("", true, 200, result, "find all!"));
        return
    }

    let isExist = validator.isEmpty(req.query.name);

    if (!isExist) {

        let result = await userModel.findAccount(req.query.name);
        if (result.length > 0) {
            res.send(response("", true, 200, result, "found!!"));
        } else {
            res.send(response("", true, 200, [], "not found"));
        }
    } else {

        let result = await userModel.findAccount();
        res.send(response("", true, 200, result, "find all!"));

    }
})

router.post("/getall", auth, async (req, res) => {

    let userid = req.user._id;
    let result = await friendsModel.getAll(userid);

    res.send(response("", true, 200, result, "get all friend"));
});

//{userID}
router.post("/add", auth, async (req, res) => {

    if (!req.body.userID) {
        res.send(response("", false, 200, [], `ID không tồn tại`));
        return;
    }

    let isID = validator.isMongoId(req.body.userID);
    if (isID) {

        let friendID = req.body.userID;
        let userID = req.user._id;

        let result = await friendsModel.addFriend(userID, friendID);

        if (result.success) {

            let result = await userModel.findById(friendID, { username: 1, email: 1 });

            res.send(response("", true, 200, result, `đã gửi lời mời kết bạn đến ${result.username}`));
        } else {
            res.send(response("", false, 200, [], `lỗi: ${result.message}`));
        }

    } else {
        res.send(response("", false, 200, [], `định dạng ID không đúng`));
    }

});

//{userID}
router.post("/newRequest/comfirm", auth, async (req, res) => {
    if (!req.body.userID) {
        res.send(response("", false, 200, [], `trường ID không tồn tại`));
        return;
    }

    let isID = validator.isMongoId(req.body.userID);
    if (isID) {

        let friendID = req.body.userID;
        let userID = req.user._id;

        let result = await friendsModel.confirmAddFriend(userID, friendID);

        if (result.success > 0) {
            let friendInfo = result.message;
            res.send(response("", true, 200, friendInfo, `đã chấp nhận lời mời kết bạn của ${friendInfo.username}`));
        } else {
            res.send(response("", false, 200, [], `lỗi: ${result.message}`));
        }

    } else {
        res.send(response("", false, 200, [], `định dạng ID không đúng`));
    }
});

//{userID}
router.post("/newRequest/cancel", auth, async (req, res) => {

    if (!req.body.userID) {

        res.send(response("", false, 404, [], "không tìm thấy trang"));
        return;

    } else if (!validator.isMongoId(req.body.userID)) {

        res.send(response("", false, 404, [], "Định dạng ID không đúng"));
        return
    }

    let friendID = req.body.userID;
    let userID = req.user._id;
    let result = await friendsModel.removeFriend(userID, friendID);

    if (result.success) {
        res.send(response("", true, 200, [], `đã từ chối`));
    } else {
        res.send(response("", false, 200, [], `lỗi nhen ${result.message}`));
    }

});

//{userID}
router.post("/delete", auth, async (req, res) => {

    if (!req.body.userID) {

        res.send(response("", false, 404, [], "không tìm thấy trang"));
        return;

    } else if (!validator.isMongoId(req.body.userID)) {

        res.send(response("", false, 404, [], "Định dạng ID không đúng"));
        return
    }

    let friendID = req.body.userID;
    let userID = req.user._id;
    let result = await friendsModel.removeFriend(userID, friendID);

    if (result.success) {
        res.send(response("", true, 200, [], `đã hủy kết bạn`));
    } else {
        res.send(response("", false, 200, [], `lỗi: ${result.message}`));
    }
});

//{userID}
router.post("/block", auth, (req, res) => {
    res.send(response("", true, 200, [], `bloack your friend ${req.user._id}`));
});

//{userID}
router.post("/unblock", auth, (req, res) => {
    res.send(response("", true, 200, [], `bloack your friend ${req.user._id}`));
});
module.exports = router;