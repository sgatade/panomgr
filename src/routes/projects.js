const express = require("express");
const randstr = require("randomstring");
const multer = require("multer");
const fs = require("fs");
const randopts = require("../utils/urlcode");
const Project = require("../models/projects");

const router = new express.Router();

// Get version
router.get("/api/version", async (req, res) => {
    console.log("Getting version...", process.env.VERSION);
    res.send(process.env.VERSION || "NO VERSION");
});

// List projects
router.get("/api/projects", async (req, res) => {

    try {
        const projects = await Project.find().sort({createdAt: -1});
        
        if(!projects) {
            // No matching project found
            console.log("[MANAGER] No projects found!");
            res.status(404).send({
                error: "Failed to list projects"
            });
        }

        console.log("[MANAGER] Listing " + projects.length + " projects...");
        // console.log("[MANAGER] Project 1 ", projects[0]);
        res.send(projects);

    } catch (error) {
        console.log("Error: ", error);
        res.status(400).send(error);
    }
});

//VIEWER ROUTE : Move to seperate route file
router.get("/view/:id", async (req, res) => {

    // Form host URL
    const host = process.env.HOST + process.env.PORT + "/";

    const project = await Project.findOne({urlcode:req.params.id});
    if(!project) {
        res.render("error", {
            errorShort: "Invalid URL!!!",
            errorLong: "URL you have supplied ending with '" + req.params.id + "' is invalid!!!"
        });
    } else {
        console.log("[VIEWER] Total of " + project.images.length + " Image(s) for Project with ID " + project._id);

        if(project.images.length <= 0) {
            res.render("error", {
                errorShort: "No images!",
                errorLong: "There are no images to display!!!"
            });
        };
        
        console.log("[VIEWER] Render Project ID : " + project._id + ", Image : " + host + project.images[0].url);
        res.render("viewer", {
            clientName: project.name,
            initial: project.images[0].url,
            images: project.images,
            baseUrl: host
        });
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

        console.log("[MANAGER] Created new project " + project.name + " with URL " + project.urlcode + "...");
        res.send(project);
        
    } catch (error) {
        console.log("CREATE PROJECT: ", error);
        res.status(400).send(error.message);
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

        // console.log("Response : ", project);

        const images = project.images || [];
        // console.log("Images", images);
    
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

// Delete Image
router.delete("/api/projects/:pid/images/:iid", async (req, res) => {
    console.log("Project ID : " + req.params.pid + ", Image ID : " + req.params.iid);
    const project = await Project.findById(req.params.pid);
    await project.images.id(req.params.iid).remove();
    await project.save();
    console.log("Remaining images : ", project.images);
    res.send(project);
});

module.exports = router;