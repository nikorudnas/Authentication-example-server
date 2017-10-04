var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true
});

var User = mongoose.model('User', userSchema);

module.exports = User;