var mongoose = require('mongoose');
var createTable = require('../helpers/createTabe');
var validate = require('validator').default;
mongoose.Promise = global.Promise;

var autoIndex = require('mongoose-auto-increment');
autoIndex.initialize(mongoose.connection);

const Schema = mongoose.Schema;

const apiDatachema = new Schema({
    ownerID: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    table_name: {
        type: String,
        required: true,
    },
    table_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    data: [
        {
            master: {
                type: Object,
                default: null,
                required: true
            },
            share: {
                type: Object,
                default: null
            },
            backup: {
                type: Object,
                default: null
            },
            isDelete: {
                type: Boolean,
                default: false
            },
            ID: Number
        }
    ]
    ,
    key_table: Number,
    count: {
        type: Number,
        default: 0
    }
});

apiDatachema.statics.INSERT = async (ownerID, tableName, fields, data) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let tableInfo = await API_data.findOne({ table_name: tableName, ownerID: ownerID });

            if (!tableInfo) {
                return false;
            }
            let insertData = {};

            for (const value of fields) {
                if (data.hasOwnProperty(value.name)) {
                    //kiểm tra xem trường được phép null hay không
                    if (value.notNull) {
                        if (data[value.name] == null || data[value.name].length < 1) {
                            throw { message: `${value.name} không được trống` }
                        }
                    }
                    //kiểm tra xem trường được pháp trùng hay không
                    if (value.isUnique) {

                        var query = {};
                        query["table_name"] = tableName;
                        query["ownerID"] = ownerID;
                        query["data.master." + value.name] = data[value.name];

                        // let result = await API_data.find({ table_name: tableName, ownerID: ownerID,});
                        let result = await API_data.find(query);

                        if (result.length > 0) {
                            throw { message: `${value.name} bị trùng` }
                        }
                        insertData[value.name] = data[value.name];
                    } else {
                        insertData[value.name] = data[value.name];
                    }
                    //<== end
                } else {
                    if (value.notNull) {
                        throw { message: `${value.name} không được trống` }
                    }
                    insertData[value.name] = "null";
                }
            }

            var master = { master: insertData, ID: tableInfo.count };

            tableInfo.count++;
            tableInfo.data = tableInfo.data.concat(master);

            await API_data.findByIdAndUpdate(tableInfo._id, tableInfo);
        });
        session.endSession();
        return true;
    } catch (error) {
        return error;
    }

}

apiDatachema.statics.UPDATE = async (ownerID, tableName, fields, id, data) => {
    if (!data) {
        return { message: `lỗi không xác định` };
    }
    try {
        let originData = await API_data.aggregate([
            { $unwind: "$data" },
            {
                $match: { 'data.ID': Number(id), 'table_name': String(tableName), "ownerID": ownerID }
            }
        ]);

        if (originData.length < 1) {
            throw { message: `không tìm thấy id ${id}` };
        }

        let updateData = originData[0].data.master;

        for (const value of fields) {
            if (data.hasOwnProperty(value.name)) {
                //kiểm tra xem trường được phép null hay không
                if (value.notNull) {
                    if (data[value.name] == null || data[value.name].length < 1) {
                        throw { message: `${value.name} không được trống` }
                    }
                }
                //kiểm tra xem trường được pháp trùng hay không
                if (value.isUnique) {
                    var query = {};
                    query["table_name"] = tableName;
                    query["ownerID"] = ownerID;
                    query["data.master." + value.name] = data[value.name];

                    if (updateData[value.name] != data[value.name]) {
                        let result = await API_data.find(query);

                        if (result.length > 0) {
                            throw { message: `${value.name} bị trùng` }
                        }
                    }

                    updateData[value.name] = data[value.name];
                } else {
                    updateData[value.name] = data[value.name];
                }
                //<== end
            } else {
                if (value.notNull) {
                    throw { message: `${value.name} không được trống` }
                }
                // updateData[value.name] = "null";
            }
        }

        return await API_data.findOneAndUpdate({ table_name: tableName, ownerID: ownerID, 'data.ID': id },
            { $set: { 'data.$.master': updateData } });

    } catch (error) {
        return error;
    }

}

//xóa dữ liệu trong bảng nếu id= -1 thì xóa tất cả dữ liệu
apiDatachema.statics.DELETE = async (ownerID, tableName, id, deleteForever) => {
    try {
        if (deleteForever === true) {
            if (id == -1) {
                return await API_data.findOneAndUpdate({ table_name: tableName, ownerID: ownerID }, { $set: { 'data': [] } });
            }
            return await API_data.findOneAndUpdate({ table_name: tableName, ownerID: ownerID, }, {
                $pull: {
                    'data': { ID: id }
                }
            });
        }

        if (id == -1) {
            return await API_data.findOneAndUpdate({ table_name: tableName, ownerID: ownerID }, { $set: { 'data.$[].isDelete': true } });
        }

        return await API_data.findOneAndUpdate({ table_name: tableName, ownerID: ownerID, 'data.ID': id },
            { $set: { 'data.$.isDelete': true } });
    } catch (error) {
        console.log(error);
        return null;
    }

}

//lấy tất cả nếu id= -1
apiDatachema.statics.SELECT = async (ownerID, tableName, id) => {

    let result = await API_data.findOne({ table_name: tableName, ownerID: ownerID });
    if (id == -1) {
        return result.data.filter(v => v.isDelete == false);
    } else {
        return result.data.find(v => v.ID == id && v.isDelete == false);
    }
}



//xóa dữ liệu trong bảng nếu id= -1 thì xóa tất cả dữ liệu
apiDatachema.statics.RESET_BD = async (ownerID, tableName) => {
    try {
        return await API_data.findOneAndUpdate({ table_name: tableName, ownerID: ownerID, },
            { $set: { 'data': [] } });
    } catch (error) {
        return null;
    }

}
const API_data = mongoose.model('API_Data', apiDatachema, "API_Data");
module.exports = API_data;