const create = function () {
    var characters = '0123456789';
    var charactersLength = characters.length;
    var result ="";
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }    
    return result;
}
module.exports = create;