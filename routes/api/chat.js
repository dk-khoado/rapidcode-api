var express = require('express');
var router = express.Router();

var response = require('../../function/response');
var auth = require('../../function/auth');

var chatModel = require('../../models/chat_model');
var chatGroupModel = require('../../models/chat_ground_model');
var messageGroup = require('../../models/message_group');
const User = require('../../models/users_model');
var dataStore = require('data-store')({ path: process.cwd() + "/data/emailWaitSend.json" })

/**
 * {reciverID, message}
 */
router.post("/newchat", auth, async (req, res) => {
    try {
        var result = await chatModel.send(req.user._id, req.body.reciverID, req.body.message);
        if (result) {
            res.send(response("", true, 200, null, "send success!"));
        } else {
            res.send(response("lỗi không xát định", false, 200, null, "send fail!"));
        }
    } catch (error) {
        res.send(response(error, false, 200, null, "send fail!"));
    }

});

//{reciverID}
router.post("/getchatcontent", auth, async (req, res) => {

    try {
        var content = await chatModel.getContent(req.user._id, req.body.reciverID);
        res.send(response("", true, 200, content, "this is all your chat"));
    } catch (error) {
        res.send(response(error, false, 200, null, "fail!"));
    }

});

//noparam
router.post("/getListMessages", auth, async (req, res) => {

    try {
        var content = await chatModel.getListMessages(req.user._id);
        res.send(response("", true, 200, content, "this is all your chat"));
    } catch (error) {
        res.send(response(error, false, 200, null, "fail!"));
    }

});

///Group chat code form here
///params: member_list: []
router.post("/createGroup", auth, async (req, res) => {
    var body = req.body;
    let groupList = [];

    body.member_list_id.push(req.user._id);

    body.owner_grounpID = req.user._id;
    body.groupID = body.owner_grounpID;
    //body.member_list = groupList;

    if (body.member_list_id.length < 3) {
        res.status(201).send(response("err", false, 201, [], "Cần tối thiểu 3 người !!!"));
    } else {
        const groupChat = new chatGroupModel(body)
        await groupChat.save().then(doc => {
            console.log(groupList[0])
            res.status(200).send(response(null, true, 200, doc, "Create success !!!"));
        }).catch(err => {
            res.status(201).send(response(err, false, 200, [], "Create fail !!!"));
        });
    }

})

router.post('/getInfoMember', auth, async (req, res) => {
    var body = req.body;
    var result = await chatGroupModel.getInfoMember(body.groupID);
    if (result) {
        res.status(200).send(response("", true, 200, result, 'Success !!!'));
    }
    else {
        res.status(202).send(response("", false, 202, [], 'False !!!'));
    }
})

router.post('/getAllGroup', auth, async (req, res) => {
    var result = await chatGroupModel.getAllGroupChat(req.user._id);
    if (result) {
        res.status(200).send(response("", true, 200, result, 'This all your group !!!'));
    }
    else {
        res.status(202).send(response("", false, 202, [], 'False !!!'));
    }
})

router.post('/addMember', auth, async (req, res) => {
    var body = req.body;
    var result = await chatGroupModel.addMember(body.groupID, body.memberID);
    if (result) {
        res.status(200).send(response("", true, 200, result, 'Add member success !!!'));
    }
    else {
        res.status(202).send(response("", false, 202, [], 'Can not add member !!!'));
    }
})

router.post('/leaveGroup', auth, async (req, res) => {
    var body = req.body;
    var result = await chatGroupModel.leaveGroup(body.groupID, body.memberID);
    if (result) {
        res.status(200).send(response("", true, 200, result, 'Leave group success !!!'));
    }
    else {
        res.status(202).send(response("", false, 202, [], 'False !!!'));
    }
})

//Chat Group
router.post("/sendChat", auth, async (req, res) => {
    try {
        var result = await messageGroup.sendToGroup(req.user._id, req.body.groupID, req.body.message);
        if (result) {
            res.send(response("", true, 200, result, "send success!"));
        } else {
            res.send(response("lỗi không xát định", false, 200, null, "send fail!"));
        }
    } catch (error) {
        res.send(response(error, false, 200, null, "send fail!"));
    }

});

router.post("/getMessageGroup", auth, async (req, res) => {

    var result = await messageGroup.getAllMessageInGroup(req.body.groupID);
    if (result) {
        var getInfo = await User.find({_id: result[0].senderID});
        for (var i = 0; i < result.length; i++) {
           var getInfo = await User.find({_id: result[i].senderID});
           result[i].set('sender_info', { "fullName":getInfo[0].fullName , "image": getInfo[0].image} , { strict: false });
        }       
        res.send(response("", true, 200, result, "send success!"));
    } else {
        res.send(response("lỗi không xác định", false, 200, null, "get fail!"));
    }


});


module.exports = router;