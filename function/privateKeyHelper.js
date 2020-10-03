var base64 = require('js-base64').Base64;
module.exports = class {

    constructor() {

    }

    decode(mPrivateKey) {
        let privateKey = mPrivateKey.split("_xxx_");
        var date = new Date();
        date.setDate(date.getHours() + 1);
        return base64.encode(privateKey[0]) + "$" + privateKey[1] + "$" + base64.encode(date.getTime());
    }

    encode(privateKey) {
        let currentDate = new Date().getTime();
        let getElementPrivateKey = privateKey.split("$");
        let getExpDay = getElementPrivateKey[2];

        let timeAfterParse = base64.decode(getExpDay);

        if (new Date(timeAfterParse).getTime() <= currentDate) {
            return null;
        }
        return base64.decode(getElementPrivateKey[0]) + "_xxx_" + getElementPrivateKey[1];

    }

    token_Protect_Key() {
        var key = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            key += possible.charAt(Math.floor(Math.random() * possible.length));

        return key + new Date().getTime().toString();
    }

    token_PrivateKey(user_id) {
        var key = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            key += possible.charAt(Math.floor(Math.random() * possible.length));

        return user_id +"_"+ key + new Date().getTime().toString();
    }
}