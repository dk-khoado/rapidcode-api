module.exports = async(email, code) => {
    var template = require("../template/ActiveAccountTemplate")
    var emailService = require('../helpers/SendToEmail');
    let config = require('../configs/config')
    var dataFile = template();
    if (!dataFile) {        
        return
    }
    var data = dataFile.toString();
    data = data.replace("%logo%", config.base_url+"/images/logoteam.jpg");
    data = data.replace("%activelink%", config.base_url+`/api/account/active?email=${email}&code=${code}`);
    data = data.replace("%activecode%", code);
    // var subject = subject ? req.body.subject : "Welcome to!";
    var success = await emailService("Kích hoạt tài khoản", data, email);
    if (success) {
        console.log("đã gửi email");
    } else {
        console.log("đã không gưi dk email");
    }
}