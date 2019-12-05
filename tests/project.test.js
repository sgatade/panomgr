const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const App = require("../src/app");
const User = require("../src/models/users");

const userOneId = mongoose.Types.ObjectId();
const userOne = {
    name: "janedoe",
    password: "Pass1987",
    tokens: [
        {token: jwt.sign( {_id: userOneId}, process.env.JWT_KEY)}
    ]
}

beforeAll(async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

test("Get version", async () => {
    await request(App)
        .get("/api/version")
        .set("Authorization", "Bearer " + userOne.tokens[0].token)
        .send()
        .expect(200);
});