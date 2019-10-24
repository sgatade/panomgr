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
    images: [{
        name: {
            type: String
        },
        url: {
            type: String
        },
        uploaded: {
            type: Date,
            default: Date.now
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