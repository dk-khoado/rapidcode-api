var express = require('express');
var router = express.Router();
var authAPI = require('../../function/authAPI');
var auth = require('../../function/auth');
var response = require('../../function/response');
var apiCustom = require('../../models/api_custom_model');
var apiDATA = require('../../models/data_table_users');
var tokens = require('../../models/tokens');
var validate = require('validator');
var getEndpoint = require('../../helpers/getEndPointHelper');
var test = require('../../helpers/codeLogic');
const { background } = require('jimp');

router.post('/:username/:table_name/insert', authAPI, async (req, res) => {

    let idUser = req.user._id;
    let isSuccess = req.dataTable

    let insert = null;
    if (isSuccess) {
        insert = await apiDATA.INSERT(idUser, isSuccess.name, isSuccess.fields, req.body);

        if (!insert.message) {
            console.log(req.body);
            res.status(201).send(response("", true, 201, [], `insert success`));
        } else {
            res.status(200).send(response(insert, false, 200, [], `insert fail`));
        }
    } else {
        res.status(200).send(response("", false, 200, [], `cannot FOUND TABLE`));
    }

})

router.post('/:username/:table_name/update/:id', authAPI, async (req, res) => {
    try {
        let idUser = req.user._id;
        let id = req.params.id;
        let isSuccess = req.dataTable

        let update = 0;
        if (isSuccess) {
            update = await apiDATA.UPDATE(idUser, isSuccess.name, isSuccess.fields, id, req.body);
            if (!update.message) {
                res.send(response("", true, 200, [], `updated success`));
            } else {
                res.send(response(update, false, 200, [], `updated fail`));
            }
        } else {
            res.send(response("", false, 200, [], `cannot FOUND TABLE`));
        }
    } catch (error) {
        res.send(response(error, false, 200, [], `error`));
    }

})

router.post('/:username/:table_name/delete', authAPI, async (req, res) => {
    let idUser = req.user._id;
    let isSuccess = req.dataTable
    //nếu không có đủ trường trong body thì k cho thực hiện thao tác
    if (!req.body.id) {
        res.status(200).send(response("trường id không tồn tại", false, 200, [], `DELETE fail`));
        return;
    }
    //nếu deleteForever = true thì xóa LUN dữ liệu trong DB
    if (req.body.deleteForever) {
        let isDeleteAll = await apiDATA.DELETE(idUser, isSuccess.name, req.body.id, true);
        if (isDeleteAll) {
            res.status(200).send(response("", true, 200, [], `DELETE success`));
        } else {
            res.status(200).send(response("", true, 200, [], `DELETE all fail`));
        }
        return;
    }

    let deleteDOC = null;
    if (isSuccess) {
        deleteDOC = await apiDATA.DELETE(idUser, isSuccess.name, req.body.id);

        if (deleteDOC) {
            res.status(201).send(response("", true, 200, [], `DELETE success`));
        } else {
            res.status(200).send(response("", false, 200, [], `DELETE fail`));
        }
    } else {
        res.status(200).send(response("", false, 200, [], `cannot FOUND TABLE`));
    }
})

//lấy tất cả dữ liệu trong bảng
router.post('/:username/:table_name/get', authAPI, async (req, res) => {
    let idUser = req.user._id;
    let isSuccess = req.dataTable;
    let data = null;

    if (isSuccess) {
        data = await apiDATA.SELECT(idUser, isSuccess.name, -1);

        if (data) {
            res.send(response("", true, 200, data, `get data success`));
        } else {
            res.send(response("", false, 200, [], `get data fail`));
        }
    } else {
        res.send(response("", false, 200, [], `cannot FOUND TABLE`));
    }
})

router.post('/:username/:table_name/get/:id', authAPI, async (req, res) => {
    let idUser = req.user._id;
    let isSuccess = req.dataTable

    let data = null;
    if (isSuccess) {
        let id = req.params.id;
        //nếu id = -1 thì sẽ không cho lấy dữ liệu
        if (id < 0) {
            res.send(response("id không được bé hơn 0", false, 200, [], `get data fail`));
            return;
        }

        data = await apiDATA.SELECT(idUser, isSuccess.name, id);

        if (data) {
            res.send(response("", true, 200, data, `get data success`));
        } else {
            res.send(response("", false, 200, [], `get data fail`));
        }
    } else {
        res.send(response("", false, 200, [], `cannot FOUND TABLE`));
    }
})

//table_name , table_fields: [{name: "username", type:"String"}]
router.post('/create/api', auth, async (req, res) => {
    if (!req.body.table_name) {
        res.send(response('', false, 200, {}, "thiếu trường table_name"));
        return;
    }

    req.body.user_id = req.user._id;
    var apis = new apiCustom(req.body);
    await apis.save().then((doc) => {
        res.send(response('', true, 200, doc, "tạo bản thành công"));
    }).catch((reason) => {
        res.send(response(reason, false, 200, [], "tạo lỗi: "+ reason));
    });
});

//table_name: table_Demo
router.post('/deleteAPI', auth, async (req, res) => {
    var body = req.body;
    let result = await apiCustom.DELETE_APIs(req.user._id, body.table_name);

    if (result && result.success != false) {
        res.send(response("", true, 200, [], " Delete " + body.table_name + " Complete !!!"));
    } else {
        res.send(response("AC601", false, 200, result, " Delete " + body.table_name + " Fail !!!"));
    }
})


router.post('/getAllAPIByID', auth, async (req, res) => {
    try {
        let dataListAPI = await apiCustom.GET_ALL_API_IN_APIs(req.user._id);
        if (dataListAPI) {
            for (var i = 0; i < dataListAPI.length; i++) {
                dataListAPI[i].set('endpoint_action', new getEndpoint(dataListAPI[i].table_name, req.user.username).getAllEndPoint(), { strict: false });
            }
            res.send(response("", true, 200, dataListAPI, "  This is all your table !!!"));
        } else {

            res.send(response("AC401", false, 200, [], " Get list API fail !!!"));

        }

    } catch (error) {
        res.status(404).send(response(error, false, 404, null, " can not get list API !!!"));
    }
});

//Update name api
//Params: old_table_name: Test_1, new_table_name: Test_1
router.post('/updateNameAPI', auth, async (req, res) => {
    let body = req.body;


    var isEmpty_New_Table = await apiCustom.find({ table_name: body.new_table_name, user_id: req.user._id }).count();
    if (isEmpty_New_Table < 1) {
        var isEmpty_Old_Table = await apiCustom.find({ table_name: body.old_table_name, user_id: req.user._id }).count();
        if (isEmpty_Old_Table > 0) {
            let result = await apiCustom.UPDATE_API_TABLE_NAME(req.user._id, body.old_table_name, body.new_table_name);
            if (result && result.success != false) {
                res.status(200).send(response("", true, 200, result, "Update API table_name success !!!"));
            } else {

                res.status(201).send(response(result, false, 201, [], "Update API table_name fail !!!"));

            }
        } else {
            res.status(201).send(response("AC701", false, 201, [], `Table ${body.old_table_name} is not exits !!!`));
        }
    }
    else {
        res.status(201).send(response("AC801", false, 201, [], `Table ${body.new_table_name} has been exits !!!`));
    }




})


//.set('Endpoint','demo',{strict:false})
router.post('/getAPIByID', auth, async (req, res) => {
    let body = req.body;
    try {
        var result = await apiCustom.GET_API_APIs(req.user._id, body.table_name);
        if (result) {
            res.status(200).send(response("", true, 200, { properties: result, endpoint_action: new getEndpoint(body.table_name, req.user.username).getAllEndPoint() }, "Get Info Api Success !!!"));
        } else {
            res.status(200).send(response("AC401", false, 200, null, "Can not get info API !!!"));
        }

    } catch (error) {
        res.status(200).send(response(error, false, 500, null, "Can not get API !!!"));
    }
})


// {
// 	"name_field":"HAHA",
// 	"type_field": "String",
// 	"table_id": "5ee789e61c991800178cf50a",
// 	"field_id": "5ee789e61c991800178cf50b",
//  "isPrivate": true,
//  "isProtect": true
// }
router.post('/updateField', auth, async (req, res) => {
    let body = req.body;

    var result = await apiCustom.UPDATE_FIELD(req.user._id, body.table_name, body.field_id, body.name_field, body.type_field, body.isNull, body.isUnique);
    if (result.success == true) {
        res.status(200).send(response("", true, 200, result, "Update success !!!"));
    } else {
        res.status(200).send(response("AC401", false, 200, result, "Can not update field api !!!"));
    }
})

router.post('/insertField', auth, async (req, res) => {
    let body = req.body;

    var result = await apiCustom.INSERT_FIELDS(req.user._id, body.table_name, body.table_fields);
    if (result.success) {
        res.status(200).send(response("", true, 200, result, "Insert field success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Can not insert field api !!!"));
    }
})

router.post('/deleteField', auth, async (req, res) => {
    let body = req.body;

    var result = await apiCustom.DELETE_FIELD(req.user._id, body.table_name, body.field_id);
    if (result.success == true) {
        res.status(200).send(response("", true, 200, result, "Delete field success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Can not delete field api !!!"));
    }
})

router.post('/getAllField', auth, async (req, res) => {
    let body = req.body;

    var result = await apiCustom.GET_ALL_FIELD(req.user._id, body.table_name);
    if (result.success == true) {
        res.status(200).send(response("", true, 200, result.data, "Get field success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Can not get field api !!!"));
    }
})

router.post('/getFieldByID', auth, async (req, res) => {
    let body = req.body;

    var result = await apiCustom.GET_FIELD_BY_ID(req.user._id, body.table_name, body.field_id);
    if (result.success == true) {
        res.status(200).send(response("", true, 200, result.data, "Get field success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Can not get field api !!!"));
    }
})

router.post('/genPublicToken', auth, async (req, res) => {
    var result = await apiCustom.GEN_PUBLIC_TOKEN(req.user._id, req.body.table_name);
    if (result) {
        res.status(200).send(response("", true, 200, result, "Gen public token success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Gen public token fail !!!"));
    }
})

router.post('/getPrivateToken', auth, async (req, res) => {
    var result = await apiCustom.GEN_PRIVATE_TOKEN(req.user._id, req.body.table_name);
    if (result) {
        res.status(200).send(response("", true, 200, result, "Gen private token success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Gen private token fail !!!"));
    }
})

router.post('/update-api', auth, async (req, res) => {
    apiCustom.UPDATE_API(req, res);
})
router.post('/getPublicToken', auth, async (req, res) => {
    var result = await tokens.find({ userid: req.user._id, tableid: req.body.id });
    if (result) {
        res.status(200).send(response("", true, 200, result, "Get public token success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Get public token fail !!!"));
    }
})

router.post('/deletePublicToken', auth, async (req, res) => {
    var result = await apiCustom.DELETE_PUBLIC_TOKEN(req.body.token);
    if (result) {
        res.status(200).send(response("", true, 200, result, "Delete public token success !!!"));
    } else {
        res.status(401).send(response("AC401", false, 401, result, "Delete public token fail !!!"));
    }
})
module.exports = router;