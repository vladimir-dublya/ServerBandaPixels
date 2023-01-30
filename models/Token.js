const {Schema, model} = require('mongoose');

const Token = new Schema({
    id : {type: Schema.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String, required: true}
});

module.exports = model('User', User);