const mongoose = require("mongoose");
const Image = require("./images");

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 35,
        minlength: 5,
        required: true,
        trim: true
    },
    urlcode: {
        type: String,
        maxlength: 10,
        required: true
    },
    size : {
        type: Number,
        default: 0
    },
    images: [{
        name: {
            type: String,
            default: 0
        },
        url: {
            type: String
        },
        uploaded: {
            type: Date,
            default: Date.now
        },
        // Added on 26th Nov.
        // @SG
        size: {
            type: Number
        }
    }],
    archived: {
        type: Boolean,
        deafult: false
    }
}, {
    timestamps: true
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;