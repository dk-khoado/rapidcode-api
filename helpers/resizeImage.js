const Jimp = require('jimp');
var userModel = require('../models/users_model');
var base64 = require('js-base64').Base64;
var fs = require('fs');
var isImage = require('is-image');


//pathGetImage là chuỗi đã được mã hóa
module.exports = async (pathGetImage, user_id) => {

    var imageUser = `${user_id}.jpg`;

    //check chuỗi có được encode hay không
    var base64Rejex = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;

    //trả về true false, kiểm tra xem chuỗi đã được băm hay chưa
    var isBase64Valid = base64Rejex.test(pathGetImage);


    fs.writeFile("public/images/" + imageUser, pathGetImage, { encoding: "base64" }, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            if (fs.existsSync("public/images/" + imageUser)) {
                Jimp.read("public/images/" + imageUser)
                    .then(image => {
                        return image
                            .resize(image.getWidth(), image.getHeight())
                            .quality(50)
                            .write(`public/images/` + imageUser);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }

        }
    });

    if (isBase64Valid) {
        if (fs.existsSync("public/images/" + imageUser)) {
            var getUserId = await userModel.find({ _id: user_id }).update({ image: imageUser });
            if (getUserId) {
                return imageUser;
            }
        }
    } 

    return null;
}
