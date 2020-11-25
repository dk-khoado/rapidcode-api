var express = require('express');
var router = express.Router();
var users = require('./account');
var apis = require('./createApi_v1');
var messenger = require('./chat');
var friends = require('./friends');
var post = require('./post');
var upload = require('./upload');
var question = require('./post_user');
var restful = require('./restful/index');

router.use('/account', users);
router.use('/v1', apis);
router.use('/restful', restful);
router.use('/messenger', messenger);
router.use('/friend', friends);
router.use('/upload', upload);
router.use('/post', post);
router.use('/question', question);

module.exports = router;