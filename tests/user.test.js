const request = require("supertest");
const express = require("express");
const App = require("../src/app");
const User = require("../src/models/users");

test('Should create a new user', async () => {
    const user = 
    await request(App).post("/api/users").send({
        name: "Test User",
        password: "Pass1982*"
    }).expect(200);
});
