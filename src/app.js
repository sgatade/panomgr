const path = require("path");
const hbs = require("hbs");
const express = require("express");

const app = express();

const connect = require("./db/mongoose");
connect(app);

// Routers
// Users
const userRouter = require("./routes/users");

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
});

// 404
app.get("*", async (req, res) => {
  res.send("<div style='font-family: verdana;'><h2>Oopsy Daisies!!!!<h2><h3>You are not allowed to view this page/directory...!</h3><p>@Panorama Manager</p></div>");
});

module.exports = app;