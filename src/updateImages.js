const readline = require("readline");
const app = new Object();

const mongoose = require("mongoose");
const Project = require("../src/models/projects");
const fs = require("fs");

// Read input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Create DB URL
const db_url = "mongodb://panomgr-db:27017/PANO-MGR-PROD";

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
        projectImageSize = 0;
        console.log("---------------------------------------------------------------------------------------");
        console.log("1. Project : " + project.name + ", Image Count : " + project.images.length + ", Size : " + project.size);
        project.images.forEach( (image) => {

            try {
                var stats = fs.statSync("./src/www/" + image.url);
                console.log("-- Image : " + image.name + ", Size : " + image.size + ", D. Size : " + stats["size"] + ", Path : " + image.url);
                if(image.size <= 0 || image.size === undefined) {
                    image.size = stats["size"];
                }

                projectImageSize += image.size;

            } catch (error) {
                console.log(error);                
            }
        });

        
        project.size = projectImageSize;
        console.log("2. Project : " + project.name + ", Image Count : " + project.images.length + ", Size : " + project.size);

        await project.save();
        
    } );
});

