var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

var userSchema = new Schema({
    id_permission: {
        type: Number,
        required: true,
        default: 0
    },

    fullName: {
        type: String,
        default: "Coder"
    },

    description: {
        type: String,
        default: null
    }
});

const Permission = mongoose.model('Permission', userSchema, "Permission");
module.exports = Permission;