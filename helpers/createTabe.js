module.exports =async function (table_name,table_id, ownerID) {

    var apiData = require('../models/data_table_users')
    
    var success = await apiData.create({table_name,table_id: table_id, ownerID: ownerID});
    if (success) {
        return true;
    } else {
        return false;
    }
};