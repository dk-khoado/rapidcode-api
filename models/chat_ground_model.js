var mongoose = require('mongoose');
const User = require('./users_model');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    owner_grounpID: {
        type: String,
        required: true
    },
    member_list_id: {
        type: Array,
        required: true
    },
    date_create: {
        type: Schema.Types.Date,
        default: () => new Date().getTime()
    },
    group_name: {
        type: String,
        required: true
    },
    last_massage: {
        type: String
    },
    last_time: {
        type: Date,
        default: Date.now()
    }
    
});

chatSchema.statics.getInfoMember = async (groupID) => {
    var groupList = [];
    var result = await CHAT_GROUNP_INFO.find({ _id: groupID });
    if (result) {
        for (let i = 0; i < result[0].member_list_id.length; i++) {
            let getName = await User.find({ _id: result[0].member_list_id[i] });
            groupList.push(getName[0]);
        }
        return groupList;
    }
    return false;
}

chatSchema.statics.getAllGroupChat = async (user_id) => {
    var result = await CHAT_GROUNP_INFO.find({});
    var userMap = [];
    if (result) {
        result.forEach(function (user) {
            if (user.member_list_id.includes(user_id) == true) {
                userMap.push(user);
            }
        });
        return userMap;
    }
    return false;

}


chatSchema.statics.addMember = async (groupID, user_id) => {
    var result = await CHAT_GROUNP_INFO.find({ _id: groupID });
    var memberArray = [];
    if (result) {
        memberArray.push(user_id);
        result[0].member_list_id.forEach(function (user) {
            memberArray.push(user);
        });
        var update = await CHAT_GROUNP_INFO.find({ _id: groupID }).update({ member_list_id: Array.from(new Set(memberArray)) });
        if (update) {
            return memberArray;
        }
        
    }
    return false;
}

chatSchema.statics.leaveGroup = async (groupID, user_id) => {
    var result = await CHAT_GROUNP_INFO.find({ _id: groupID });
    var memberArray = [];
    if (result) {
        result[0].member_list_id.forEach(function (user) {
            if (user != user_id) {
                memberArray.push(user);
            }
        });
        var update = await CHAT_GROUNP_INFO.find({ _id: groupID }).update({ member_list_id: memberArray });
        if (update) {
            if(user_id === result[0].owner_grounpID){
                var updateOwner = await CHAT_GROUNP_INFO.find({ _id: groupID }).update({ owner_grounpID: memberArray[0] })
                if(updateOwner){
                    return memberArray;
                }
            }
            return memberArray;
        }
    }
    return false;
}

chatSchema.statics.changeGroupName = async () => {
    
}

chatSchema.statics.changeOwner = async () => {
    
}

const CHAT_GROUNP_INFO = mongoose.model('CHAT_GROUNP_INFO', chatSchema, "messenger_group_info");

module.exports = CHAT_GROUNP_INFO;