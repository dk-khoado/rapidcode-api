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
const APIExcuteController = require("../../controllers/APIExcuteController")
const APIManagerController = require("../../controllers/APIManagerController")

router.post('/:username/:table_name/insert', authAPI, APIExcuteController.INSERT)

router.post('/:username/:table_name/update/:id', authAPI, APIExcuteController.UPDATE)

router.post('/:username/:table_name/delete', authAPI, APIExcuteController.DELETE)

//lấy tất cả dữ liệu trong bảng
router.post('/:username/:table_name/get', authAPI, APIExcuteController.GET)

router.post('/:username/:table_name/get/:id', authAPI, APIExcuteController.GET_BY_ID)

//table_name , table_fields: [{name: "username", dataType:"String"}], project_id=?
router.post('/create/api', auth, APIManagerController.create);

//table_name: table_Demo
router.post('/deleteAPI', auth, APIManagerController.deleteAPI)


router.post('/getAllAPIByID', auth, APIManagerController.getAllAPIByID);

//Update name api
//Params: old_table_name: Test_1, new_table_name: Test_1
router.post('/updateNameAPI', auth, APIManagerController.update_name)


//.set('Endpoint','demo',{strict:false})
router.post('/getAPIByID', auth, APIManagerController.getAPIByID)
router.get('/api_tool/:id', auth, APIManagerController.getAPIByID_method_get)


// {
// 	"name_field":"HAHA",
// 	"type_field": "String",
// 	"table_id": "5ee789e61c991800178cf50a",
// 	"field_id": "5ee789e61c991800178cf50b",
//  "isPrivate": true,
//  "isProtect": true
// }
router.post('/updateField', auth, APIManagerController.update_field)

router.post('/insertField', auth, APIManagerController.insert_field)

router.post('/deleteField', auth, APIManagerController.delete_field)

router.post('/getAllField', auth, APIManagerController.get_all_field)

router.post('/getFieldByID', auth, APIManagerController.get_field_by_id)

router.post('/update-api', auth, APIManagerController.update_pro_api)

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