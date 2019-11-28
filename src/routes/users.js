const express = require("express");
const jwt = require("jsonwebtoken");
const Project = require("../models/projects");

const router = new express.Router();

// Create User
router.post("/api/users", async (req, res) => {

    try {
        const user = new User(req.body);
        user.token = jwt.sign({id: user.name}, user.name);
        await user.save();

        res.send(user);

    } catch (error) {
        res.status(400).send(error);
    }
});

// Login User
router.post("/api/users/login", async (req, res) => {

    try {

        if(req.body.name == "nmj" && req.body.pwd == "nmj") {
            res.send();
        } else {
            res.status(400).send({
                error: "User name or password is wrong!"
            });
        }
        
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;