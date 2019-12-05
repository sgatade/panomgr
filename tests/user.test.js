const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const App = require("../src/app");
const User = require("../src/models/users");

const userOneId = mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: "jondoe",
    password: "Pass1987*",
    tokens: [
        {
            token: jwt.sign({_id: userOneId}, process.env.JWT_KEY)
        }
    ]
}

beforeAll( async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

// Create new user
test('Should create a new user', async () => {
    await request(App).post("/api/users").send({
        name: "janedoe",
        password: "Pass1987*"
    }).expect(200);
});

// Login existing user
test('Should log in existing user', async () => {
    await request(App).post("/api/users/login").send({
        name: userOne.name,
        password: userOne.password
    }).expect(200);
})

// Reject login for bad password
test('Should NOT log in existing user due to bad password', async () => {
    await request(App).post("/api/users/login").send({
        name: userOne.name,
        password: userOne.password + "asd"
    }).expect(400);
})

// Delete existing user
test("Should delete an existing user", async () => {
    await request(App)
        .delete("/api/users")
        .set("Authorization", "Bearer " + userOne.tokens[0].token)
        .send({})
        .expect(200);
});