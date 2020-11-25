var express = require('express');
var router = express.Router();
var auth = require('../../function/auth');
var Model = require("../../models/users_model")
var Service = require("../../services/AccountService").AccountService
var Controller = require("../../controllers/AccountController").AccountController

const AccountController = new Controller(new Service(Model))
/* 
{
	"username":"kakoi" or "email":"khoa123@gmail.com"
	"password":"123",
}
*/
router.post('/login', AccountController.login);

/**
{
	"username":"kakoi",
	"password":"123",
	"email":"khoa@gmail.com"
}
 */
router.post('/register', AccountController.register);

//no param
router.post('/profile', auth, AccountController.get_profile);

/*
{
  fullName:'123',
  birthday:'321',
  gender: null,
  image: null (đây là link thư mục hình ảnh đã được băm bằng base64 )
}
*/
router.post('/updateProfile', auth, AccountController.update_profile);


router.post('/changepassword', auth, AccountController.change_password);

//Email: duy@gmail.com
router.post('/forgotpassword', AccountController.forgot_password);

//private_key : 2465465465465awdawd65465awdawd.awd.awd , newpassword
router.post('/resetpassword', AccountController.reset_password)

router.get('/active', AccountController.active_account)

router.post('/senmail', AccountController.send_mail)


router.get('/ValidateKeyForgot/:key', AccountController.validate_key_forgot);


router.post('/getUserByID', auth, AccountController.get_user_by_id)

router.get('/checkExsit', AccountController.check_exist)

module.exports = router;