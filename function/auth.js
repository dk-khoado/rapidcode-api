const jwt = require('jsonwebtoken')
const User = require('../models/users_model');

const auth = async (req, res, next) => {
    try {
        var token = req.header('Authorization').replace('Bearer ', '')
        var payload = jwt.decode(token);
        var user = await User.findOne(
            { '_id': payload._id });
        jwt.verify(token, user.private_key);  
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        // console.log('[error]', error);
        res.status(401).send({ error: 'Not authorized to access this resource' });
    }
}
module.exports = auth