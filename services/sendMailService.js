var start = async () => {
    // console.log("check email "); 
    let dataStore = require('data-store')({ path: process.cwd() + "/data/emailWaitSend.json" })
    let sendMail = require("../function/sendEmailActiveAccount");
    let sendMailForgotPass = require("../function/sendEmailForgotPassword");
    let emails = [];
    emails = dataStore.get("email");
    if (emails) {
        // console.log("start send mail");
        for (const value of emails) {
            console.log(value);
            try {
                switch (value.action) {
                    case "":
                        await sendMail(value.address, value.data.activeCode);
                        break;
                    case "fg":
                        await sendMailForgotPass(value.address, value.data.key, value.data.code);
                    default:
                        break;
                }
            } catch (error) {
                
            }
        }
        dataStore.clear();
        // console.log("send email finsish!!");
    }
    setTimeout(() => start(), 10000);
}
// setInterval(() => {
//     start();                          
// }, 5000);
start();