const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: 15,
        minlength: 3,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Project"
    }
}, {
    timestamps: true
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;