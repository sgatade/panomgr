const path = require("path");
const express = require("express");

const app = express();

const connect = require("./db/mongoose");
connect(app);

// Routers
// WWW : gallery
const galleryRouter = require("./routes/gallery");

// API : Projects 
const projectRouter = require("./routes/projects");

// Built in
app.use(express.json());

// Static
const wwwPath = path.join(__dirname, "./www");
app.use(express.static(wwwPath));

// app.use(galleryRouter);
app.use(projectRouter);

module.exports = app;