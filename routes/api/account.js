var express = require('express');
var router = express.Router();
var User = require('../../models/users_model');
var tempForgotModel = require('../../models/tempForgotPassword');
var auth = require('../../function/auth');
var response = require('../../function/response');
var base64 = require('js-base64').Base64;
var privateKeyHelper = require('../../function/privateKeyHelper');
var dataStore = require('data-store')({ path: process.cwd() + "/data/emailWaitSend.json" });
var resizeImage = require('../../helpers/resizeImage');

//function Private
function addListWaitSendEmail(data, action) {
  let mAction = "";
  if (action) {
    mAction = action;
  }
  let listMail = dataStore.get("email");
  if (!listMail) {
    listMail = [{ address: data.email, data: data, action: mAction }]
  } else {
    listMail.push({ address: data.email, data: data, action: mAction });
  }
  dataStore.set("email", listMail);
}

var emailService = require('../../helpers/SendToEmail');
const Jimp = require('jimp');
/* 
{
	"username":"kakoi" or "email":"khoa123@gmail.com"
	"password":"123",
}
*/
router.post('/login', async function (req, res, next) {
  try {
    var { username, email, password } = req.body
    var user = await User.findByCredentials(username, email, password)
    if (!user) {

      // return res.status(200).send(response(null, false, 200, [], "login fail!!"));
      throw "login fail!!";
    }
    var token = await user.generateAuthToken()
    if (!token) {
      throw "token generate fail!!";
    }
    var dataUser = {
      "active": user.active,
      "isdelete": user.isdelete,
      "id": user._id,
      "username": user.username,
      "password": user.password,
      "email": user.email,
      "dateCreate": user.dateCreate,
      "private_key": "",
    };
    res.send(response(null, true, 200, { user: dataUser, token: token }, "login success!!"))
    // res.send(response(null, true, 200, { user, token: token }, "login success!!"))
  } catch (error) {
    console.log('[error]', error);
    return res.status(200).send(response(error, false, 200, [], "login fail!!"));
  }
});
/**
{
	"username":"kakoi",
	"password":"123",
	"email":"khoa@gmail.com"
}
 */
router.post('/register', async function (req, res, next) {
  try {
    const user = new User(req.body)
    await user.save().then(doc => {
      addListWaitSendEmail(doc);
      res.status(201).send(response(null, true, 201, [doc], "SignUp Success! Check Email to active account"));
    }).catch(err => {
      res.status(200).send(response(err, false, 200, [], err.message));
    });
  } catch (error) {
    res.status(400).send(response(error, false, 400, [], "error"))
  }
});

//no param
router.post('/profile', auth, async function (req, res, next) {
  let user = await User.findById(req.user._id);
  res.status(200).send(response("", true, 200, user, ""));
});

/*
{
  fullName:'123',
  birthday:'321',
  gender: null,
  image: null (đây là link thư mục hình ảnh đã được băm bằng base64 )
}
*/
router.post('/updateProfile', auth, async (req, res) => {
  var body = req.body
  try {
    body.image = base64.encode("/images/" + body.image)
    var isUpdateDone = await User.updateProfile(req.user._id, body.username, body.fullName, body.birthday, body.gender, body.image);
    if (isUpdateDone) {
      let userInfo = await User.findById(req.user._id);
      res.status(200).send(response("", true, 200, userInfo, ' update profile success!'));
    } else {
      res.status(200).send(response("AC301", false, 200, [], ' update profile fail!'));
    }
  } catch (error) {
    res.status(200).send(response(error, false, 500, null, " update profile fail !!!"));
  }
});


router.post('/changepassword', auth, async (req, res) => {
  var body = req.body;
  try {
    if (body.oldpassword != null && body.newpassword != null) {

      var isSuccess = await User.comparePassword(req.user._id, body.oldpassword);

      if (isSuccess) {
        await User.findById(req.user._id, (err, result) => {
          if (err) return;

          result.newpassword = body.newpassword;

          result.save().then(async doc => {

            var user = await User.findByCredentials(req.user.username, req.user.email, body.newpassword)
            if (!user) {

              // return res.status(200).send(response(null, false, 200, [], "login fail!!"));
              throw "login fail!!";
            }
            var token = await user.generateAuthToken()
            if (!token) {
              throw "token generate fail!!";
            }

            res.status(200).send(response("", true, 200, { newToken: token }, ' password has change!'));

          }).catch(error => {

            console.log(error);
            res.status(404).send("lỗi máy chủ");
          });

        });

      } else {
        res.status(200).send(response("", false, 200, [], 'Old password is incorrect!'));
      }

    } else {
      res.status(200).send(response("", false, 200, [], 'Old password is incorrect!'));
    }
  } catch (error) {
    res.status(404).send("lỗi máy chủ");
  }
});

//Email: duy@gmail.com
router.post('/forgotpassword', async (req, res) => {
  var body = req.body;
  if (!body.email) {
    res.status(200).send(response("AC601", false, 200, [], "Email is required"));
    return;
  }
  var checkLogin = await User.forgotPassword(body.email);
  //fg là forgot password
  if (checkLogin) {
    addListWaitSendEmail(checkLogin, 'fg');
    res.status(200).send(response("", true, 200, [], `Sent to email ${body.email}`));
  } else {
    res.status(200).send(response("", false, 200, [], "Email does not exist"));
  }

  if (body.email == "") {
    res.status(200).send(response("AC601", false, 200, [], "Email is required"));
    return;
  }
  //fg là forgot password
  var checkLogin = await User.forgotPassword(body.email);
  if (checkLogin) {
    addListWaitSendEmail(checkLogin, 'fg');
    res.status(200).send(response("", true, 200, [], `Sent to email ${body.email}`));
  } else {
    res.status(200).send(response("AC701", false, 200, [], "Email does not exist"));
  }
});

//private_key : 2465465465465awdawd65465awdawd.awd.awd , newpassword
router.post('/resetpassword', async (req, res) => {
  var body = req.body;

  if (body.private_key == null || body.newpassword == null) {
    res.status(404).send();
    return;
  }
  let getPrivateKey = new privateKeyHelper().encode(body.private_key);
  await User.findOne({ private_key: getPrivateKey }, (err, result) => {
    if (err) return;
    if (result == null) {
      res.status(404).send();
      return;
    }
    result.newpassword = body.newpassword;
    result.save().then(doc => {
      res.status(200).send(response("", true, 200, doc, ' password has change!'));
    }).catch(error => {
      console.log(error);
      res.status(404).send();
    });
  });
})

router.get('/active', async (req, res) => {
  var params = req.query;
  var isSuccess = await User.activeAccount(params.email, params.code);
  if (isSuccess) {
    res.send("active success");
  } else {
    res.send(params);
  }
})

router.post('/senmail', async (req, res) => {

  var template = require("../../template/ActiveAccountTemplate")
  var emailService = require('../../function/sendEmailActiveAccount');

  var dataFile = template();
  if (!dataFile) {
    res.send("đã không gưi dk email");
    return
  }
  await emailService("violent12340@gmail.com", "123456");
  res.send("đã gửi");
})


router.get('/ValidateKeyForgot/:key', async (req, res, next) => {
  let key = req.params.key;

  var result = await tempForgotModel.validateKey(key);

  if (result) {

    var resultUser = await User.findOne({ email: result })
    var rawPrivateKey = new privateKeyHelper().decode(resultUser.private_key);
    req.key = rawPrivateKey;
    next();
  } else {
    res.status(200).send({ msg: "key is valid", "Private_key": "" });
  }
},
  async (req, res) => {not
    //res.render('forgot_password/index', { key: req.key });
    res.status(200).send({ "Private_key": req.key, msg: "" });
  });

//params: pathGetImage: public/images/logoteam.jpg
router.post('/updateImageProfile', auth, async (req, res) => {

  let body = req.body;

  if (body.pathGetImage != null || body.pathGetImage != "") {
    let updateImage = await resizeImage(body.pathGetImage, req.user._id);
    if (updateImage) {
      res.status(200).send(response("", true, 200, updateImage, 'Image has upate !!!'));
    }
    else {
      res.status(202).send(response("AC301", false, 202, [], 'Can not update !!!'));
    }
  } else {
    res.status(202).send(response("AC601", false, 202, [], 'File is empty !!!'));
  }
})

router.post('/getUserByID', auth, async (req, res) => {

  var body = req.body;

  var result = await User.getUserByID(body.userID);
  if (result) {
    res.status(200).send(response("", true, 200, result, 'Get user success !!!'));
  }
  else {
    res.status(202).send(response("AC301", false, 202, null, 'Get user fail !!!'));
  }
})

router.get('/checkExsit', async (req, res) => {

  var value = req.query.value;

  try {
    var result = await User.findOne({$or:[{email: value}, {username:value}]})
    if (result) {
      res.status(200).send(response("", true, 200, null, `${value} already exist !!!`));
    }
    else {
      res.status(200).send(response("AC301", false, 200, null, ''));
    }
  } catch (error) {
    res.status(200).send(response("AC301", false, 200, null, ''));
  }
})
module.exports = router;
