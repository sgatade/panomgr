const express = require("express");
const randstr = require("randomstring");
const multer = require("multer");
const fs = require("fs");
const randopts = require("../utils/urlcode");
const Project = require("../models/projects");

const router = new express.Router();

// List projects
router.get("/api/projects", async (req, res) => {

    try {
        const projects = await Project.find();
        
        if(!projects) {
            // No matching project found
            res.status(404).send({
                error: "Failed to list projects"
            });
        }

        res.send(projects);

    } catch (error) {
        res.status(400).send(error);
    }
});

// Get project details : not used
router.get("/api/projects/:id", async (req, res) => {

    try {
        const project = await Project.findById(req.params.id);
        
        if(!project) {
            // No matching project found
            res.status(404).send({
                error: "Failed to find project with ID : " + req.params.id
            });
        }

        res.send(project);

    } catch (error) {
        res.status(400).send(error);
    }
});

// Create new Project
router.post("/api/projects", async (req, res) => {

    try {

        // Check for duplicate URLCODE
        let codeOk = false;
        let urlcode = "";
        while (!codeOk) {
            urlcode = randstr.generate(randopts);    
            const tempProject = await Project.findOne({urlcode})
            if(!tempProject) {
                // If no project with matching URLCODE is found, then the current URLCODE is good to go
                console.log("Creating new project with URLCODE : ", urlcode);

                // Set URLCODE to reqbody
                req.body["urlcode"] = urlcode;

                codeOk = true;
            } else {
                codeOk = false;
            }
        }

        // Set archive if not set already
        if(!req.body["archived"]) {
            req.body["archived"] = false;
        }

        // Create the project
        const project = new Project(req.body);
        await project.save();

        res.send(project);
        
    } catch (error) {
        res.status(400).send(error);
    }
});

// Config multer
// var storage = multer.diskStorage({
//     dest: ""
    // function (req, file, callback) {
    //     callback(null, './uploads/' + "name1");
    // }
//     // ,
    // filename: function (req, file, cb) {
    //     cb(null, "aconda1");
    // }
// });

var storage = multer.diskStorage({
    destination: function (req, file, callback) {

        let folder = './src/www/gallery/' + req.body.project.urlcode;
        console.log(folder);
        if(!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        callback(null, folder);
    },
    filename: function (req, file, callback) {
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});
var upload = multer({storage: storage});

// Upload image
router.post("/api/projects/images", upload.array("image", 5), (req, res) => {
    // console.log("Request : ", req);
    // console.log("Body : ", req.body);
    
    const path = "gallery/" + req.body.project.urlcode + "/" + req.files[0].originalname;
    console.log("Images uploaded to : ", path);

    Project.findById(req.body.project._id).then( (project) => {

        console.log("Response : ", project);

        const images = project.images || [];
        console.log("Images", images);
    
        images.push({name: "Change Name", url: path});
    
        project.images = images;
    
        project.save();
        res.send(project);
    
    }, (error) => {
        console.log("Not able to find project with ID : " + req.body.project._id + ", " + error);
        res.status(400).send(error);
    });
    
});

// Update project (Name & Archive Status)
router.patch("/api/projects/:id", async (req, res) => {
    
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        
        if(!project) {
            // No matching project found
            res.status(404).send({
                error: "Failed to find project with ID : " + req.params.id
            });
        }

        res.send(project);

    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a project
router.delete("/api/projects/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if(!project) {
            // No matching project found
            res.status(404).send({
                error: "Failed to find project with ID : " + req.params.id
            });
        }

        res.send(project);

    } catch (error) {
        res.status(400).send(error);
    }
});

// Update Image name
router.patch("/api/projects/:pid/images/:iid", async (req, res) => {
    console.log("Project ID : " + req.params.pid + ", Image ID : " + req.params.iid + ", New Name : " + req.body.name);
    const project = await Project.findById(req.params.pid);
    project.images.id(req.params.iid).name = req.body.name
    await project.save();
    console.log(project.images.id(req.params.iid));
    res.send(project);
});

module.exports = router;