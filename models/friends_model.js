var mongoose = require('mongoose');
var chatModel = require('../models/chat_model');
mongoose.Promise = global.Promise;

var userModel = require('./users_model');

const Schema = mongoose.Schema;

var friendSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    friendID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status: {
        type: Number,
        // enum: [
        //     0,//đã gửi yêu cầu
        //     1,//đang chờ xát nhận
        //     2,//đã chấp nhận yêu cầu                        
        // ]
    },
    isBlock: {
        type: Boolean,
        default: false,
        required: true,
    }
});
friendSchema.statics.getAll = async (userID) => {

    let list_friend = await FRIENDS.find({ userID: userID, });
    let friendInfo = [];
    //tạo câu điều kiện $or:[friendID: "ádasd", ]
    for (let index = 0; index < list_friend.length; index++) {
        friendInfo.push({ _id: list_friend[index].friendID });
    }
    let result = [];
    if (friendInfo.length > 0) {
        let resultFriendsInfo = await userModel.find({ $or: friendInfo, isdelete: false }, { _id: 1, username: 1, email: 1, image: 1, fullName: 1 });
        //lọc kết hợp kết quả của 2 bảng lại. và lọc thông tin cần xuất

        for (let index = 0; index < resultFriendsInfo.length; index++) {

            const emlement = resultFriendsInfo[index];

            let tempIndex = list_friend.findIndex(v => v.friendID == emlement.id);

            if (tempIndex > -1) {

                let dataMess = await chatModel.findOne({ reciverID: list_friend[tempIndex].friendID }).sort({ send_date: -1 })
                console.log(dataMess)
                if (dataMess != null) {
                    result.push({
                        userID: list_friend[tempIndex].userID,
                        friendID: list_friend[tempIndex].friendID,
                        status: list_friend[tempIndex].status,
                        isBlock: list_friend[tempIndex].isBlock,
                        fullName: emlement.fullName,
                        username: emlement.username,
                        email: emlement.email,
                        image: emlement.image,
                        message: dataMess.message
                    });
                }else{
                    result.push({
                        userID: list_friend[tempIndex].userID,
                        friendID: list_friend[tempIndex].friendID,
                        status: list_friend[tempIndex].status,
                        isBlock: list_friend[tempIndex].isBlock,
                        fullName: emlement.fullName,
                        username: emlement.username,
                        email: emlement.email,
                        image: emlement.image
                    });
                }
            }

        }
    }

    return result;
}


//thêm bạn mới =))
friendSchema.statics.addFriend = async (userID, friendID) => {
    const session = await mongoose.startSession();

    try {
        if (userID == friendID) {
            return { success: false, message: "không thể tự kết bạn với chính mình" }
        }
        await session.withTransaction(async () => {

            let isFriends = await FRIENDS.findOne(
                { userID: userID, friendID: friendID }
            );
            //kiểm trả nếu đã là bạn hoặc đã gửi lời mời            
            if (isFriends) {
                switch (isFriends.status) {
                    case 0:
                        throw "đã gửi lời mời kết bạn"
                    case 1:
                        throw "hãy chấp nhận lời mời kết bạn"
                    case 2:
                        throw "Đã là bạn của nhau"
                    default:
                        break;
                }
            }
            //update trạng thái của người gửi yêu cầu là đã gửi
            await FRIENDS.findOneAndUpdate(
                { userID: userID, friendID: friendID },
                { $set: { status: 0, isBlock: false } },
                { upsert: true, new: true });

            //update trạng thái của người nhận được yêu cầu là chờ xát nhận
            await FRIENDS.findOneAndUpdate(
                { userID: friendID, friendID: userID },
                { $set: { status: 1, isBlock: false } },
                { upsert: true, new: true });

        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });
        session.endSession();

        return { success: true, message: "đã kết bạn" };
    } catch (error) {

        session.endSession();
        return { success: false, message: error };
    }
}

friendSchema.statics.confirmAddFriend = async (userID, friendID) => {
    const session = await mongoose.startSession();
    try {
        if (userID == friendID) {
            return { success: false, message: "không thể tự kết bạn với chính mình" }
        }
        await session.withTransaction(async () => {

            let accept = await FRIENDS.findOneAndUpdate(
                { userID: userID, friendID: friendID, status: 1 }
                , { $set: { status: 2 } })

            let request = await FRIENDS.findOneAndUpdate(
                { userID: friendID, friendID: userID, status: 0 }
                , { $set: { status: 2 } });

            if (accept == null || request == null) {
                throw "không tìm thấy lời mời";
            }
        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });
        session.endSession();
        let result = await userModel.findById(friendID, { username: 1, email: 1 })
        return { success: true, message: result }
    } catch (error) {

        session.endSession();
        return { success: false, message: error }
    }
}

//từ chối thêm bạn mới =)) && hủy kết bạn lun
friendSchema.statics.removeFriend = async (userID, friendID) => {
    const session = await mongoose.startSession();

    try {
        if (userID == friendID) {
            return { success: false, message: "lỗi nhen" }
        }
        await session.withTransaction(async () => {

            await FRIENDS.findOneAndDelete(
                { userID: userID, friendID: friendID });

            await FRIENDS.findOneAndDelete(
                { userID: friendID, friendID: userID });
        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });

        session.endSession();

        return { success: true, message: "đã hủy yeu cầu" };
    } catch (error) {

        session.endSession();
        return { success: false, message: error };
    }
}

friendSchema.statics.blockFriend = async (userID, friendID) => {
    const session = await mongoose.startSession();
    try {
        if (userID == friendID) {
            return { success: false, message: "không xát định" }
        }
        await session.withTransaction(async () => {

            let user = await FRIENDS.findOneAndUpdate(
                { userID: userID, friendID: friendID }
                , { $set: { isBlock: true } }).countDocuments();

            let friend = await FRIENDS.findOneAndUpdate(
                { userID: friendID, friendID: userID }
                , { $set: { isBlock: true } }).countDocuments();

        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });

        session.endSession();
        return { success: true, message: "đã chặn userID:" + friendID }
    } catch (error) {

        session.endSession();
        return { success: false, message: error }
    }
}

friendSchema.statics.unBlockFriend = async (userID, friendID) => {
    const session = await mongoose.startSession();
    try {
        if (userID == friendID) {
            return { success: false, message: "không xát định" }
        }
        await session.withTransaction(async () => {

            let user = await FRIENDS.findOneAndUpdate(
                { userID: userID, friendID: friendID }
                , { $set: { isBlock: false } }).countDocuments();

            let friend = await FRIENDS.findOneAndUpdate(
                { userID: friendID, friendID: userID }
                , { $set: { isBlock: false } }).countDocuments();
        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });

        session.endSession();
        return { success: true, message: "đã bỏ chặn userID:" + friendID }
    } catch (error) {

        session.endSession();
        return { success: false, message: error }
    }
}
const FRIENDS = mongoose.model('friends', friendSchema, "friends");
module.exports = FRIENDS;