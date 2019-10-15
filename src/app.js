const path = require("path");
const hbs = require("hbs");
const express = require("express");

const app = express();

const connect = require("./db/mongoose");
connect(app);

// Routers
// Users
const userRouter = require("./routes/users");

// WWW : gallery
const galleryRouter = require("./routes/gallery");

// API : Projects 
const projectRouter = require("./routes/projects");

// Built in
app.use(express.json());

// Static
const wwwPath = path.join(__dirname, "./www");

app.set("view engine", "hbs");  // HBS for the Viewer Page
hbs.localsAsTemplateData(app);
app.use(express.static(wwwPath));

// app.use(galleryRouter);
app.use(projectRouter);
app.use(userRouter);

// Error handler
app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err)
  })

module.exports = app;