const User = require('../models/users_model');
var apiCustom = require('../models/api_custom_model');
var tokenModel = require('../models/tokens');
const validate = require('validator').default;
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try {
        var token = req.header('Authorization').replace('Bearer ', '')

        if (validate.isJWT(token)) {
            var payload = jwt.decode(token);
            var user = await User.findOne(
                { '_id': payload._id });
            jwt.verify(token, user.private_key);

            let isSuccess = await apiCustom.selectTable(user._id, req.params.table_name, req.params.username);

            req.dataTable = isSuccess;
            req.user = user;
            return next();
        }        

        let objectToken = token.split("_");
        if (validate.isMongoId(objectToken[0])) {
            let userObject = await User.findById(objectToken[0]);
            let isSuccess = await apiCustom.SELECT_TABLE(userObject._id, req.params.username, req.params.table_name, token);

            req.dataTable = isSuccess;
            req.user = userObject;
            return next();
        }

        let result = await User.findOne({ username: req.params.username });
        if (!result) {
            throw "user không tồn tại";
        }

        let isSuccess = await apiCustom.SELECT_TABLE(result._id, req.params.username, req.params.table_name, token);
        req.dataTable = isSuccess;
        req.user = result;
        next();
    } catch (error) {
        if (error.msg) {
            res.status(200).send({ error: error.msg });
        } else {
            res.status(200).send({ error: 'You do not have permission'});
        }

    }
}
module.exports = auth