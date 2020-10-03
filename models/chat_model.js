var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const chatChema = new Schema({
    senderID: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    reciverID: {
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

chatChema.statics.getContent = async (senderID, reciverID) => {
    return await CHAT.find({
        $or: [
            { senderID: senderID, reciverID: reciverID },
            { reciverID: senderID, senderID: reciverID }
        ]
    }, null, {
        sort: { send_date: -1 },
        limit: 50,
        skip: 0
    });
}

chatChema.statics.send = async (senderID, reciverID, message) => {
    var chatObject = {
        senderID: senderID,
        reciverID: reciverID,
        message: message
    }

    var result = await CHAT.create(chatObject);
    if (result) {
        return true;
    }
    return false;
}

chatChema.statics.getListMessages = async (userID) => {

    var result = await CHAT.aggregate([
        {
            $match: {
                $or: [{
                    senderID: userID
                }, {
                    reciverID: userID
                }],
                isNewSmg: true
            }
        },
        {
            $group:
            {
                _id: {
                    senderID: "$senderID",
                    reciverID: "$reciverID"
                },
                count: {
                    $sum: 1
                },
                isSeen: {
                    $max: "$isNewSmg"
                }
            }
        },
        {
            $project: {
                _id: 0,
                senderID: "$_id.senderID",
                reciverID: "$_id.reciverID",
                countNewMessage: "$count"
            }
        },
        {
            $match: {
               reciverID: userID
            }
        }
    ])
    if (result) {
        return result;
    }
    return null;
}

const CHAT = mongoose.model('chat', chatChema, "messenger");

module.exports = CHAT;