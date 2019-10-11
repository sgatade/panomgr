const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 35,
        minlength: 5,
        required: true,
        trim: true
    },
    password: {
        type: String,
        maxlength: 20,
        required: true
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;