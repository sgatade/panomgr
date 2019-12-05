const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        maxlength: 35,
        minlength: 5,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Pre Save to hash password
userSchema.pre("save", async function (next) {
    console.log("Saving user...");
    const user = this;

    if(user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Return Public verion of users profile
userSchema.methods.getPublicProfile = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

// Return JWT 
userSchema.methods.getAuthToken = async function () {
    const user = this;

    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_KEY.toString());
    user.tokens = user.tokens.concat({ token });

    // Save token
    await user.save();

    return token;
};

// Find user
userSchema.statics.findUser = async (name, password) => {
    
    console.log("FindUser : Details : Name : " + name + ", Pwd : " + password);

    // Try and find single user by name
    const user = await User.findOne({name});
    if(!user) {
        throw new Error("Unable to login! Bad username or password!!!");
    }

    console.log("FindUser : User FOund! ");

    // See if password matches
    console.log("FindUser : PWD : " + password + " : " + user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("FindUser : PWD Match : " + isMatch);
    if(!isMatch) {
        throw new Error("Unable to login! Bad username or password!!!");
    }

    return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;