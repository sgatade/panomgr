
const app = new Object();

const mongoose = require("mongoose");
const Project = require("../src/models/projects");
const fs = require("fs");

// Create DB URL
const db_url =
  "mongodb://" +
  process.env.DB_IP +
  ":" +
  process.env.DB_PORT +
  "/" +
  process.env.DB_NAME;

mongoose.connect(db_url,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
).then( async (success) => {
    console.log("Connected to " + db_url);

    // List all projects
    const projects = await Project.find();
    // console.log("Projects : ", projects);

    let projectImageSize = 0;
    projects.forEach( async (project) => {
        console.log("Project : " + project.name + ", Image Count : " + project.images.length + ", Size : " + project.size);
        project.images.forEach( async (image) => {

            try {
                var stats = await fs.statSync("./src/www/" + image.url);
                console.log("-- Image : " + image.name + ", Size : " + image.size + ", D. Size : " + stats["size"] + ", Path : " + image.url);
                projectImageSize += stats["size"];

            } catch (error) {
                console.log(error);                
            }
            
        });

        console.log("Project Size : " + project.size);
        await project.save();
        projectImageSize = 0;
    } );
});

