module.exports = async (email, key, code) => {
    var template = require("../template/ForgotPasswordTemplate")
    var emailService = require('../helpers/SendToEmail');
    let config = require('../configs/config')
    var dataFile = template();
    if (!dataFile) {
        return
    }
    var data = dataFile.toString();
    data = data.replace("%logo%", config.base_url + "/images/logoteam.jpg");
    data = data.replace("%code%", code);
    data = data.replace("%link%", config.base_url + `/api/account/ValidateKeyForgot/${key}`);
    // var subject = subject ? req.body.subject : "Welcome to!";
    var success = await emailService("Quên mật khẩu", data, email);
    if (success) {
        console.log("đã gửi email");
    } else {
        console.log("đã không gưi dk email");
    }
}