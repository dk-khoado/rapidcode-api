var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const Tokens = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    token: { type: String, require },
    tableid: {
        type: Schema.Types.ObjectId,
        required: true
    },
    role: { type: Number, max: 4, min: 0, default: 0 },
    numberOfUses: { type: Number, min: 0, default: 10 },
    numberOfUsed: { type: Number, min: 0, default: 0 },
    limitUses: { type: Boolean, default: false }
})

module.exports = mongoose.model("tokens", Tokens, "Tokens");