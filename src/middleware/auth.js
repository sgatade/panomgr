const jwt = require("jsonwebtoken");
const User = require("../models/users");

const auth = async (req, res, next) => {

    console.log("Req Method " + req.method + ", Path : " + req.path + ", Auth : " + req.header("Authorization"));

    try {
        
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = await jwt.verify(token, process.env.JWT_KEY.toString());

        // Decoded contains _id, find the relevant user with the id and token
        // console.log("Auth ID : " + decoded._id + ", Token : " + token);
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

        // Res.redirect to /logout & deprecate the token, then force re-login by sending 401 code back to frontend
        // @SG on 2-Dec-2019
    }
}

module.exports = auth;