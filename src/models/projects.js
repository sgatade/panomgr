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
    archived: {
        type: Boolean,
        deafult: false
    }
}, {
    timestamps: true
});

// Add images as virtual field
projectSchema.virtual('images', {
    ref: "Image",
    localField: "_id",
    foreignField: "project"
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;