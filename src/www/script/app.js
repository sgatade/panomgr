var app = angular.module("panomgr", ["ngRoute", "ngFileUpload"]);

let post_config = {
    "Content-Type": "application/json" 
};

let post_upload = {
      "Content-Type": "multipart/form-data"
};

app.constant('env', {
    URL: "http://localhost:3000"
});

function showURL(projectURL){
    
}

app.controller("UserController", function($scope, $window, $http) {
    $scope.status = "Ready...";

    // User object
    $scope.user = {
        name: "",
        pwd: ""
    }

    $scope.login = () => {

        console.log("user", $scope.user);

        $http.post("/api/users/login", $scope.user, post_config).then((data) => {
            
            // Login success
            if(data.status == 200) {
                console.log("Applying path");
                // $location.path('/home/ABC123');
                // $scope.$apply();
                $window.location.href = "/home.html?ID=ABC123";
            }

        }, (error) => {

            // Login Failure
            console.log("Error : ", error);
            
            if(error.status == 400) {
                $scope.status = error.data.error;
            }
        });
    }
});

// Viewer controller
app.controller("ViewerController", function($scope, $routeParams, $http){

    console.log("Params", $routeParams);

});

app.controller("ProjectsController", function($scope, $http, $window, $document, Upload){
    
    console.log("Here....");
    $scope.status = "Loading...";
    $scope.projects = [];

    // Get list of projects
    $scope.list = () => {
        $http.get("/api/projects", post_config).then((response) => {
            
            // Success
            $scope.projects = response.data;

            // Set project to 1st project
            if($scope.projects.length <= 0) {
    
                $scope.selectedProject = null;
                
            } else {
                $scope.selectedProject = $scope.projects[0];

                // Set the project as choosen
                $scope.choose($scope.selectedProject);
            }
            

        }, (error) => {

            // Login Failure
            console.log("Error : ", error);
            if(error.status == 400) {
                $scope.status = error.data.error;
            }
        });
    }

    // Add Project function
    $scope.project = {
        name: ""
    };

    $scope.create = () => {
        if(!$scope.project.name || $scope.project.name.length <= 0) {
            alert("Could not get the project name, cannot created project!");
            return;
        }

        $http.post("/api/projects", $scope.project, post_config).then((response) => {
            console.log("NEW PROJECT RESPONSE", response);
            // alert("New project " + $scope.project.name + " created!");
            $scope.list();
            $scope.project.name = "";

        }, (error) => {
            alert("Failed to create new project " + $scope.project.name + " !!!" + "\n" + error.data);
        });
    }

    // Show project gallery when a project is choosen
    $scope.selectedProject = "";
    $scope.choose = (project) => {
        console.log("Project Choosen : ", project);

        // Set active/inactive for CSS background of the link
        $scope.projects.forEach( (p) => {
            console.log("Changing " + p.name);
            if(p._id == project._id) {
                p["active"] = true;
            } else {
                p["active"] = false;
            }
        });

        $scope.selectedProject  = project;
    };

    // Delete project
    $scope.delete = (project) => {
        var confirmed = $window.confirm("Are you sure you want to delete this project?");
        if(confirmed) {
            $http.delete("/api/projects/" + project._id).then((response) => {
                alert("Project " + project.name + " deleted!");

                // Update list
                $scope.list();

            }, (error) => {
                alert("Failed to delete " + project.name + " Project!" + "\n" + error.data);
            });

            // Refresh projects
            $scope.list();
        }
    }

    // Upload images
    $scope.uploadStatus = "";
    $scope.upload = (files) => {

        if(!$scope.selectedProject) {
            alert("Please choose a project to upload files for...");
        } 

        console.log(files);
        $scope.uploadStatus = "Uploading " + files.length + " file(s) : "
        if(files && files.length) {
            $scope.uploadStatus = "Uploaded " + files.length + " file(s) : "
            files.forEach( (file) => {
                console.log("PROJEX : ", $scope.selectedProject);
                Upload.upload({
                    url: "/api/projects/images",
                    data: {
                        "project": $scope.selectedProject,
                        image: file
                    }
                }).then( (response) => {
                    console.log("RESPONSE : ", response);
                    $scope.uploadStatus += file.name + ", ";

                    // Set project to local
                    $scope.selectedProject = response.data;

                    // Update list
                    $scope.list();

                    // Set the project as choosen
                    $scope.choose($scope.selectedProject);
                }, (error) => {
                    console.log(error);
                    alert("Failed to upload file!\n" + error.data);
                });
            })
        }
    };

    // Update image name
    $scope.updateImageName = (project, image) => {
        // alert("Project : " + project._id + ", Image : " + image._id + ", New Name : " + image.name);
        $http.patch("/api/projects/" + project._id + "/images/" + image._id, image).then( (response) => {
            // Set project to local
            $scope.selectedProject = response.data;

            // Set the project as choosen
            $scope.choose($scope.selectedProject);

            $scope.projects[$scope.selectedProject].active = true;

            console.log("Success!");
        }, (error) => {
            console.log("Failed to update image name : ", error.data);
            alert("Failed to update image name!\n", error.data);
        });
    };

    // Update image name
    $scope.deleteImage = (project, image) => {
        var confirmed = $window.confirm("Are you sure you want to delete " + image.name + " from " + project.name + " ?");

        if(confirmed) {
            // alert("Project : " + project._id + ", Image : " + image._id + ", New Name : " + image.name);
            $http.delete("/api/projects/" + project._id + "/images/" + image._id).then( (response) => {
                console.log("Managed to delete image!");
                // Set project to local
                $scope.selectedProject = response.data;

                // Set the project as choosen
                $scope.choose($scope.selectedProject);
            }, (error) => {
                console.log("Failed to delete image : ", error);
                alert("Failed to delete image!\n" + error.data);
            });
        }
    };

    $scope.getURL = (url) => {
        console.log("Project : " + url);
        let purl = "http://" + $window.location.hostname + ':' + $window.location.port + '/view/' + url;
        prompt("Copy and paste the below URL into your brower!", purl);
    };

    $scope.list();
});