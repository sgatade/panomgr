const request = require("supertest");
const express = require("express");
const App = require("../src/app");
const User = require("../src/models/users");

const userOne = {
    name: "jondoe",
    password: "Pass1987*"
}

beforeAll( async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

test('Should create a new user', async () => {
    await request(App).post("/api/users").send({
        name: "janedoe",
        password: "Pass1987*"
    }).expect(200);
});

test('Should log in existing user', async () => {
    await request(App).post("/api/users/login").send(userOne).expect(200);
})