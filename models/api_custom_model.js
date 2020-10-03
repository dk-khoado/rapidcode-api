var mongoose = require('mongoose');
var createTable = require('../helpers/createTabe');
var apiCustom = require('../models/data_table_users');
var userModel = require('../models/users_model');
var tokenModel = require('../models/tokens');
var validate = require("validator").default;
var types = require('../configs/listDataType');
var gen_key_api = require('../function/privateKeyHelper');
var response = require('../function/response');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const apiCustomSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    url: {
        type: String,
        default: "demo"
    },
    table_name: {
        type: String,
        required: true,
    },
    table_fields: [{
        name: { type: String, require: true },
        dataType: { type: String, require: true },
        notNull: { type: Boolean, default: false },
        isUnique: { type: Boolean, default: false }
    }],
    isPrivate: {
        type: Boolean,
        default: true,
    },
    isRESTFull: {
        type: Boolean,
        default: false,
    },
    code_logic: {
        type: String,
        default: "",
    },
    isProtect: {
        type: Boolean,
        default: true
    },
    private_token: {
        type: String,
        unique: true
    }
});

apiCustomSchema.pre('save', async function (next) {

    var apis = this;
    var result = await APIs.find({ table_name: apis.table_name, user_id: apis.user_id }).count();
    if (result > 0) {
        throw { message: "table đã tồn tại" }
    } else {

        for (let index = 0; index < apis.table_fields.length; index++) {

            const element = apis.table_fields[index];

            if (!element.name) {
                throw { message: `name cannot null` }
            }

            if (!element.dataType) {
                throw { message: `type cannot null` }
            }

            if (!validateName(element.name)) {
                throw { message: `Field Name:${apis.table_name} tên không hợp lệ` }
            }

            var passType = false;
            for (let index = 0; index < types.data.length; index++) {
                const type = types.data[index];
                if (element.dataType == type) {
                    passType = true;
                    break;
                }
            }
            if (passType == false) {
                throw { message: `Field Name:${element.name} kiểu dữ liệu không đúng` }
            }

            let arrayField = apis.table_fields.filter((v) => v.name == element.name);

            if (arrayField.length > 1) {
                throw { message: `Field Name:${element.name} trường bị trùng` }
            }
        }
        if (!validateName(apis.table_name)) {
            throw { message: `Table Name:${apis.table_name} tên không hợp lệ` }
        }
        let userName = await userModel()
        var token = new gen_key_api().token_PrivateKey(apis.user_id);
        apis.private_token = token;
        await createTable(apis.table_name, apis._id, apis.user_id);
        next();
    }
})
apiCustomSchema.statics.selectTable = async (id, tableName, url_base) => {
    var doc = await APIs.findOne({
        $or: [
            { user_id: id, table_name: tableName },
        ]
    }).populate("user_id");

    if (doc) {
        if (doc.isPrivate == true) {
            if (doc.url == url_base || doc.user_id.username == url_base) {
                return { name: doc.table_name, fields: doc.table_fields };
            }
            return null;
        }

        if (doc.user_id.username == url_base) {
            return { name: doc.table_name, fields: doc.table_fields };
        }
    } else {
        return null;
    }
}
//chọn bảng phiên bản mới =))
apiCustomSchema.statics.SELECT_TABLE = async (id, username, tableName, token, isRoot = false) => {

    var doc = await APIs.findOne({
        $or: [
            { user_id: id, table_name: tableName },
        ]
    }).populate("user_id");

    if (doc) {

        if (doc.private_token == token) {
            if (doc.url == username || doc.user_id.username == username) {
                return { name: doc.table_name, fields: doc.table_fields };
            }
            return null;
        }
        if (doc.isProtect == true) {
            var tokens = await tokenModel.findOneAndUpdate({ token: token, }, { $inc: { numberOfUsed: 1 } });
            if (tokens || doc.private_token == token) {
                if (tokens.limitUses && tokens.numberOfUsed > tokens.numberOfUses) {
                    throw { msg: "This token has used too much" }
                }
                return { name: doc.table_name, fields: doc.table_fields };
            }
            throw "You do not have permission"
        }

        if (doc.user_id.username == username) {
            return { name: doc.table_name, fields: doc.table_fields };
        }
    } else {
        return null;
    }
}

function validateName(name) {
    return /^[A-Za-z0-9_]+$/.test(name);
}

//Xóa API trong table APIs
apiCustomSchema.statics.DELETE_APIs = async (user_id, table_name) => {
    const session = await mongoose.startSession();

    if (table_name == "" || table_name == null) {
        return { success: false, message: "Table name is required !!!", code: "AC601" };
    }
    try {
        await session.withTransaction(async () => {
            await APIs.find({ user_id: user_id, table_name: table_name }).remove();
            await apiCustom.find({ ownerID: user_id, table_name: table_name }).remove();

        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });

        session.endSession();

        return { success: true, message: "Đã xóa api thành công !!!" };
    } catch (error) {

        session.endSession();
        return { success: false, message: error };
    }
}

//Lấy tất cả API hiện có theo ownerID
apiCustomSchema.statics.GET_ALL_API_IN_APIs = async (id) => {
    var listAPI = await APIs.find({ user_id: id });
    if (listAPI) {
        return listAPI;
    }

    return { success: false, message: "", code: "AC301" };;
}

//Update table_name by user_id trong bảng APIs
apiCustomSchema.statics.UPDATE_API_TABLE_NAME = async (user_id, old_table_name, new_table_name) => {
    const session = await mongoose.startSession();

    if (new_table_name == "" || new_table_name == null) {
        return { success: false, message: "New table is required !!!", code: "AC601" };
    }

    if (old_table_name == "" || old_table_name == null) {
        return { success: false, message: "Old table is required !!!", code: "AC601" };
    }
    try {
        await session.withTransaction(async () => {
            let resul = await APIs.findOneAndUpdate({ user_id: user_id, table_name: old_table_name }, { table_name: new_table_name });
            let resul1 = await apiCustom.findOneAndUpdate({ ownerID: user_id, table_name: old_table_name }, { table_name: new_table_name });
            if (!resul || !resul1) {
                throw "lỗi"
            }
        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });

        session.endSession();

        return { success: true, message: " Đã update api thành công !!!" };
    } catch (error) {

        session.endSession();
        return { success: false, message: error };
    }
}

apiCustomSchema.statics.GET_API_APIs = async (user_id, table_name) => {
    var apiInfo = await APIs.findOne({ user_id: user_id, table_name: table_name });
    // var isTable_Exist = await APIs.findOne({ user_id: user_id, table_name: table_name }).count();
    if (table_name == "" || table_name == null) {
        throw { success: false, message: "Table name is required !!!", code: "AC601" };
    }

    if (apiInfo) {
        return apiInfo;
    }

    return null;
}

apiCustomSchema.statics.UPDATE_FIELD = async (user_id, table_name, field_id, name_field, type_field, isNull, isUnique) => {
    var apiInfo = await APIs.findOne({ user_id: user_id, table_name: table_name });
    if (apiInfo) {

        //Tìm đúng tới nới chứa id của field
        var data = {
            "info": apiInfo.table_fields
        }

        var infoField = data.info.find(obj => obj._id == field_id);

        var dataSelect = await apiCustom.SELECT(user_id, apiInfo.table_name, -1);

        //Kiểm tra dataType
        if (infoField.dataType == type_field) {
            if (type_field != "" || type_field != null) {
                infoField.dataType = type_field;
            } else {
                return { success: false, message: "Type field can not be null !!!" };
            }
        } else {
            if (dataSelect.length == 0) {
                infoField.dataType = type_field;
            } else {
                if (dataSelect[0].master[infoField.name] != null || dataSelect[0].master[infoField.name] != undefined) {
                    infoField.dataType = infoField.dataType;
                    return { success: false, message: "Trường này đã tồn tại dữ liệu !!! Không cho phép chỉnh sửa !!!" };
                } else {
                    infoField.dataType = type_field;
                }
            }
        }

        //Kiểm tra name field
        if (infoField.name == name_field) {
            if (type_field != "" || type_field != null) {
                infoField.name = name_field;
            }
        } else {
            if (apiInfo.table_fields.some(obj => obj.name == name_field)) {
                return { success: false, message: "Tên field đã tồn tại vui lòng chọn tên field khác !!!" };
            } else {
                if (name_field == "" || name_field == null) {
                    return { success: false, message: "Name field can not be null !!!" };
                } else {
                    infoField.name = name_field;
                }
            }
        }

        infoField.notNull = isNull;
        infoField.isUnique = isUnique;

        var update = await APIs.findOneAndUpdate({ user_id: user_id, table_name: table_name }, { table_fields: apiInfo.table_fields });
        if (update) {
            return { success: true, message: "Update field success !!!" };
        }

    }

    return { success: false, message: "Lỗi không xác định !!!" };;
}

apiCustomSchema.statics.INSERT_FIELDS = async (user_id, table_name, tableFields) => {
    var result = await APIs.findOne({ user_id: user_id, table_name: table_name });
    if (result) {
        var resultData = result.table_fields.map(function (obj) {
            return {
                name: obj.name
            };
        });
        for (let i = 0; i < tableFields.length; i++) {
            if (resultData.some(item => item.name == tableFields[i].name)) {
                return { success: false, message: tableFields[i].name + " đã tồn tại trong bảng vui lòng chọn tên khác hoặc bỏ trường" }
            } else {
                result.table_fields = result.table_fields.concat(tableFields[i]);
            }
        }

        var insert = await APIs.findOneAndUpdate({ user_id: user_id, table_name: table_name },
            { "table_fields": result.table_fields }, { runValidators: true });
        if (insert) {
            return { success: true, message: "Insert field success !!!" }
        }
    }

    return false;
}

apiCustomSchema.statics.DELETE_FIELD = async (user_id, table_name, field_id) => {
    var result = await APIs.findOne({ user_id: user_id, table_name: table_name });
    console.log(result)
    var infoField = result.table_fields.find(obj => obj._id == field_id);
    var dataSelect = await apiCustom.SELECT(user_id, result.table_name, -1);

    if (result) {
        if (dataSelect.length == 0) {
            result.table_fields = result.table_fields.filter(obj => obj._id != field_id)
        } else {
            if (dataSelect[0].master[infoField.name] != null || dataSelect[0].master[infoField.name] != undefined) {
                return { success: false, message: "Trường này đã tồn tại dữ liệu !!! Không cho phép xóa dữ liệu !!!" };
            } else {
                result.table_fields = result.table_fields.filter(obj => obj._id != field_id)
            }
        }

        var isDelete = await APIs.findOneAndUpdate({ user_id: user_id, table_name: table_name }, { table_fields: result.table_fields });
        if (isDelete) {
            return { success: true, message: "Delete field success !!!" }
        }
    }

    return { success: false, message: "Lỗi không xác định !!!" };
}

apiCustomSchema.statics.GET_ALL_FIELD = async (user_id, table_name) => {
    var result = await APIs.findOne({ user_id: user_id, table_name: table_name });
    if (result) {
        return { success: true, data: result.table_fields }
    }
    return false;
}

apiCustomSchema.statics.GET_FIELD_BY_ID = async (user_id, table_name, field_id) => {
    var result = await APIs.findOne({ user_id: user_id, table_name: table_name });
    var infoField = result.table_fields.find(obj => obj._id == field_id);
    if (infoField) {
        return { success: true, data: infoField }
    }
    return false;
}

apiCustomSchema.statics.GEN_PUBLIC_TOKEN = async (user_id, table_name) => {
    var result = await APIs.findOne({ user_id: user_id, table_name: table_name });
    if (result) {
        var token = new gen_key_api().token_Protect_Key();
        var genKey = new tokenModel({ userid: user_id, token: token, tableid: result._id });
        try {
            await genKey.save();
            return token;
        } catch (error) {
            return false;
        }

    }
    return false;
}

apiCustomSchema.statics.GEN_PRIVATE_TOKEN = async (user_id, table_name) => {
    var result = await APIs.findOne({ user_id: user_id, table_name: table_name });
    var token = new gen_key_api().token_PrivateKey(user_id);
    if (result) {
        var genKey = await APIs.findOneAndUpdate({ user_id: user_id, table_name: table_name }, { private_token: token });
        if (genKey) {
            return token;
        }
    }
    return false;
}

apiCustomSchema.statics.DELETE_PUBLIC_TOKEN = async (token) => {
    let result = await tokenModel.deleteOne({ token: token });
    console.log(result);
    if (result.deletedCount > 0) {
        return true;
    }
    return false;
}

apiCustomSchema.statics.UPDATE_API = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let body = req.body;
            var result = await APIs.findOneAndUpdate({ user_id: req.user._id, _id: body.table_id },
                { isProtect: body.isProtect, isPrivate: body.isPrivate, table_name: body.new_table_name }, { runValidators: true });

            let resul_data = await apiCustom.findOneAndUpdate({ ownerID: req.user._id, table_id: result._id },
                { table_name: body.new_table_name }, { runValidators: true });
            if (result != null && resul_data != null) {
                res.status(200).send(response("", true, 200, result, "Update success !!!"));
            } else {
                session.abortTransaction();
                throw new Error("lỗi");
            }
        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });
        session.endSession();
    } catch (error) {
        session.endSession();
        console.log(error);
        res.status(200).send(response("AC401", false, 200, {}, "Can not update api !!!"));
    }
}
const APIs = mongoose.model('API', apiCustomSchema, "APIs");
module.exports = APIs;