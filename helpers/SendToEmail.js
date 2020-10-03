var nodemailer = require('nodemailer');

module.exports = async (subject, templateEmail, toEmail) => {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'futureteateam@gmail.com',
            pass: 'corhwelpyuiymwxa'
        }
    });

    var mailOptions = {
        from: 'DEV.EZTeam@gmail.com',
        to: toEmail,
        subject: subject,
        html: templateEmail,
    };

    try {
        var success = await transporter.sendMail(mailOptions);
        if (success) {
            return true
        }
    } catch (error) {
        console.log(error);
        return false;
    }

}