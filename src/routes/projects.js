const express = require("express");
const randstr = require("randomstring");
const randopts = require("../utils/urlcode");
const Project = require("../models/projects");

const router = new express.Router();

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

    res.send("Hello from Project Router! " + randstr.generate(randopts));
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
})

module.exports = router;