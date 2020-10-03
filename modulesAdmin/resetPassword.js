var userModel = require('../models/users_model');
var bcrypt = require('bcrypt');


var text = "";
var possible = "abcdefghijklmnopqrstuvwxyz0123456789";


bcrypt.hash(text, 10).then((hashedPassword) => {
        userModel.password = hashedPassword;
})

module.exports = async (user_id) => {

    for (var i = 0; i < 10; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    //var newRandomPassword = randomPassword();
    bcrypt.hash(text, 10).then((hashedPassword) => {
        userModel.password = hashedPassword;
    })

    var getPassword_User = await userModel.find({ _id: user_id }).update({ password: userModel.password });
    if (getPassword_User) {

        console.log("Đây là password: " + text);
        console.log("Đây là password sau khi hash: " + userModel.password);

        return userModel.password;
    }
    return null;
}