const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const auth = require("../middleware/auth");

const router = new express.Router();

// Create User
router.post("/api/users", async (req, res) => {
    
    try {
        const user = new User(req.body);
        
        await user.save();

        res.send(user.getPublicProfile());

    } catch (error) {
        res.status(400).send(error);
    }
});

// Login User
router.post("/api/users/login", async (req, res) => {

    try {

        const user = await User.findUser(req.body.name, req.body.password);
        const token = await user.getAuthToken();
        
        res.send( {user: user.getPublicProfile(), token} );
        
    } catch (error) {
        res.status(400).send({message: error.message});
    }
});

// Remove user
router.delete("/api/users", auth, async (req, res) => {
    try {
        
        const user = await User.findByIdAndDelete(req.user._id);
        if(!user) {
            res.status(400).send({
                error: "Failed to delete user, bad request?"
            });
        }

        res.send(user.getPublicProfile());

    } catch (error) {
        res.status(400).send({
            error: error.message
        });
    }
});

// Not yet called
router.post("/api/users/logout", auth, async (req, res) => {
    try {
        
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })

        await req.user.save();

        res.send();

    } catch (error) {
        res.status(500).send({error});
    }
});

module.exports = router;