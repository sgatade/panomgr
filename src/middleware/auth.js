const jwt = require("jsonwebtoken");
const User = require("../models/users");

const auth = async (req, res, next) => {

    console.log("Req Method " + req.method + ", Path : ", req.path);
    console.log("Auth Header : " + req.header("Authorization"));

    try {
        
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = await jwt.verify(token, process.env.JWT_KEY.toString());

        // Decoded contains _id, find the relevant user with the id and token
        const user = await User.findOne( {_id: decoded._id, 'tokens.token': token} );
        
        if(!user) {
            throw new Error("Not able to find user!");
        }

        // Store user & token to the main request
        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        console.log("Error : ", error);
        res.status(401).send({message: error.message});
    }
}

module.exports = auth;