const {Schema, model} = require('mongoose');

const User = new Schema({
    id : {type: String, unique: true, required: true},
    id_type: {type: String, unique: false, required: true},
    password: {type: String, unique: false, required: true},
});

module.exports = model('User', User);