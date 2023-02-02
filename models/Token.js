const {Schema, model} = require('mongoose');

const Token = new Schema({
    user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    token: {type: String, required: true},
})

module.exports = model('Token', Token);