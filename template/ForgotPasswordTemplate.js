var fs = require('fs');
var path = require('path');
module.exports = () => {

    try {       
        let url  = path.join(__dirname,"forgot_password.htm" )
        var data = fs.readFileSync( url);
        if (data) {
            return data;
        }
    } catch (error) {
        console.log(error);
       return null;
    }
}
