var mongoose = require('mongoose');
var chatGroupInfo = require('../models/chat_ground_model');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const messageGroupChema = new Schema({
    senderID: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    groupID: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true,
    },
    send_date: {
        type: Schema.Types.Date,
        default: () => new Date().getTime()
    },
    isNewSmg: {
        type: Boolean,
        default: true,
    },
});

messageGroupChema.statics.sendToGroup = async (senderID, groupID, message) => {
    var chatObject = {
        senderID: senderID,
        groupID: groupID,
        message: message
    }

    var result = await MESSAGE_GROUP.create(chatObject);
    if (result) {
        var updateLastMess = await chatGroupInfo.find({ _id: groupID }).update({ last_massage: message })
        if (updateLastMess) {
            return chatObject;
        }
    }
    return false;
}

messageGroupChema.statics.getAllMessageInGroup = async (GroupID) => {
    var result = await MESSAGE_GROUP.find({groupID: GroupID});
    if(result){
        return result;
    }
    return false;
}

const MESSAGE_GROUP = mongoose.model('MESSAGE_GROUP', messageGroupChema, "messenger_group");

module.exports = MESSAGE_GROUP;