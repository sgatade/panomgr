var app = angular.module("panomgr", ["ngRoute", "ngStorage", "ngFileUpload"]);

let post_config = {
    "Content-Type": "application/json",
};

let post_upload = {
    "Content-Type": "multipart/form-data"
};

let gUser = undefined;
let gToken = undefined;

app.constant('env', {
    URL: "http://localhost:3000"
});

function showURL(projectURL) {

}

app.controller("UserController", function ($scope, $window, $http, $sessionStorage) {
    $scope.status = "Loading";

    $scope.$storage = $sessionStorage;

    // User object
    $scope.user = {
        name: "",
        pwd: ""
    };

    $scope.checkURL = () => {
        let url = new URL($window.location);
        let code = url.searchParams.get("code");
        console.log(code);
        if(parseInt(code) === 401) {
            console.log("You need to re-login...");
            $scope.status = "Invalid login or session, please login again...";
        }
    };

    $scope.login = () => {

        console.log("user", $scope.user);

        $http.post("/api/users/login", $scope.user, post_config).then((response) => {

            // Login success
            if (response.status == 200) {
                console.log("Applying path");

                // console.log("Token : ", response.data.token);
                $scope.$storage.token = response.data.token;
                // console.log("User : ", response.data.user);
                $scope.$storage.user = JSON.stringify(response.data.user);
                $window.location.href = "/home.html";
            }

        }, (error) => {

            // Login Failure
            // console.log("Error All : ", error);

            if (error.status == 400) {
                $scope.status = error.data.message;
            }
        });
    }
});

// Viewer controller
app.controller("ViewerController", function ($scope, $routeParams, $http) {

    console.log("Params", $routeParams);

});

app.controller("ProjectsController", function ($scope, $http, $window, $sessionStorage, $document, Upload) {
    $scope.$storage = $sessionStorage;

    // Add auth token to the header
    $http.defaults.headers.common['Authorization'] = "Bearer " + $scope.$storage.token;

    $scope.status = {
        e: false,
        mesg: "Loading...",
        ani: false
    };

    $scope.log = (m, e = false, a = false) => {
        $scope.status.e = e;
        $scope.status.mesg = m;
        $scope.status.ani = a;
    }

    $scope.log("Loading");

    // Get version
    $scope.version = "NONE";
    $scope.getVersion = () => {
        $http.get("/api/version", post_config).then((response => {
            $scope.version = response.data;
        }),
            (error) => {
                // Auth issue, force re-login
                if (error.status === 401) {
                    console.log("Invalid user/session. Please log-in again...");
                    $window.location.href = "/index.html?code=401";
                } else {
                    $scope.log("Failed to get version!");
                    $scope.version = "NONE";
                };
            });
    }

    $scope.projects = [];

    // Get list of projects
    $scope.list = () => {
        $scope.log("Listing projects...");
        $http.get("/api/projects", post_config).then((response) => {

            // Success
            $scope.projects = response.data;

            console.log("Proj Length : " + $scope.projects.length);
            let projImageSize = 0;
            $scope.projects.forEach((project) => {
                console.log(project.name);
                project.images.forEach((image) => {
                    console.log(image.size);
                    projImageSize += image.size;
                })
                project["size"] = projImageSize;
                projImageSize = 0;
            });

            console.log("Projects : ", $scope.projects);

            // Set project to 1st project
            if ($scope.projects.length <= 0) {

                $scope.selectedProject = null;

                $scope.log("No project(s) available!");

            } else {
                $scope.selectedProject = $scope.projects[0];


                // Set the project as choosen
                $scope.choose($scope.selectedProject);

                $scope.log("Listing " + $scope.projects.length + " project(s)...");
            }

        }, (error) => {

            // Auth issue, force re-login
            if (error.status === 401) {
                console.log("Invalid user/session. Please log-in again...");
                $window.location.href = "/index.html?code=401";
            } else {
                // Login Failure
                console.log("Error : ", error);
                $scope.log("Failed to load projects!", true);
            };
        });
    }

    // Change Project Name input background if there is no text or text is deleted
    $scope.checkInput = () => {
        var projNameInput = document.getElementById("inputProjectName");
        if (projNameInput.value.length <= 0) {
            projNameInput.style.backgroundColor = "white";
        }
    }

    // Add Project function
    $scope.project = {
        name: ""
    };

    $scope.create = () => {
        var projNameInput = document.getElementById("inputProjectName");
        if (!$scope.project.name || $scope.project.name.length <= 5) {
            $scope.log("Project name too short!", true);
            projNameInput.style.backgroundColor = "red";
            return;
        } else {
            projNameInput.style.backgroundColor = "white";
        }

        $scope.log("Creating new project...", null, true);

        $http.post("/api/projects", $scope.project, post_config).then((response) => {
            console.log("NEW PROJECT RESPONSE", response);
            // alert("New project " + $scope.project.name + " created!");
            $scope.list();
            $scope.log("New project created!", null, false);
            $scope.project.name = "";

        }, (error) => {
            // Auth issue, force re-login
            if (error.status === 401) {
                console.log("Invalid user/session. Please log-in again...");
                $window.location.href = "/index.html?code=401";
            } else {
                // Login Failure
                $scope.log("Failed to create new project : " + error.data, null, false);
                console.log("Failed to create new project " + $scope.project.name + " !!!" + "\n" + error.data);
            };
        });
    }

    // Show project gallery when a project is choosen
    $scope.selectedProject = "";
    $scope.choose = (project) => {
        console.log("Project Choosen : ", project);

        // Set active/inactive for CSS background of the link
        $scope.projects.forEach((p) => {
            // console.log("Changing " + p.name);

            if (p._id == project._id) {
                p["active"] = true;
            } else {
                p["active"] = false;
            }
        });

        $scope.selectedProject = project;
        // $scope.log("Ready...");
    };

    // Edit projects
    $scope.edit = (project) => {
        var newName = $window.prompt("Please enter a new name for the project?", project.name);
        console.log(newName);

        if (!newName || newName.length <= 0) {
            $scope.log("Invalid name provided, cancelling rename!", null, false);
            return;
        }

        $http.patch("/api/projects/" + project._id, { name: newName }).then((response) => {
            console.log("Project name changed! ", response.data);
            $scope.log("Project name changed!", null, false);

            $scope.list();

        }, (error) => {
            // Auth issue, force re-login
            if (error.status === 401) {
                console.log("Invalid user/session. Please log-in again...");
                $window.location.href = "/index.html?code=401";
            } else {
                // 
                console.log("Failed to change project name : ", error);
                $scope.log("Failed to change project name : " + error.data, true, false);
            };
        });
    };

    // Delete project
    $scope.delete = (project) => {
        var confirmed = $window.confirm("Are you sure you want to delete this project?");
        if (confirmed) {
            $scope.log("Deleting selected project!", true, true);
            $http.delete("/api/projects/" + project._id).then((response) => {
                $scope.log("Selected project deleted!", false, false);

                // Update list
                $scope.list();

            }, (error) => {
                // Auth issue, force re-login
                if (error.status === 401) {
                    console.log("Invalid user/session. Please log-in again...");
                    $window.location.href = "/index.html?code=401";
                } else {
                    // 
                    $scope.log("Failed to delete selected project!", true, false);
                    console.log("Failed to delete " + project.name + " Project!" + "\n" + error.data);
                };
            });

            // Refresh projects
            $scope.list();
        }
    }

    // Upload images
    $scope.uploadStatus = "";
    $scope.upload = (files) => {
        $scope.uploadStatus = "";
        if (!$scope.selectedProject) {
            alert("Please choose a project to upload files for...");
        }

        $scope.log("Selected " + files.length + " file(s) to upload...");
        if (files && files.length) {
            $scope.log("Uploading " + files.length + " file(s)...", null, true);
            files.forEach((file) => {
                console.log("PROJEX : ", $scope.selectedProject);
                $scope.log("Uploading " + file.name + "...", null, true);
                Upload.upload({
                    url: "/api/projects/images",
                    data: {
                        "project": $scope.selectedProject,
                        image: file
                    }
                }).then((response) => {
                    console.log("RESPONSE : ", response);
                    $scope.log("Uploaded " + file.name + "...");

                    // Set project to local
                    $scope.selectedProject = response.data;

                    // Update project size
                    // Move to backend TODO: @sg on 26th Nov.
                    let projImageSize = 0;
                    $scope.selectedProject.images.forEach((image) => {
                        console.log(image.size);
                        projImageSize += image.size;
                    })
                    $scope.selectedProject["size"] = projImageSize;

                    // Update list
                    // $scope.list();

                    // // Set the project as choosen
                    // $scope.choose($scope.selectedProject);
                }, (error) => {
                    console.log(error);
                    $scope.log("Failed to upload file!", true);
                    alert("Failed to upload file!", error.data);
                });
            });
        }
    };

    // Update image name
    $scope.updateImageName = (project, image) => {
        $scope.log("Changing image name...", null, true);
        // alert("Project : " + project._id + ", Image : " + image._id + ", New Name : " + image.name);
        $http.patch("/api/projects/" + project._id + "/images/" + image._id, image).then((response) => {
            // Set project to local
            $scope.selectedProject = response.data;

            // Set the project as choosen
            $scope.choose($scope.selectedProject);

            // $scope.projects[$scope.selectedProject].active = true;
            $scope.log("Image name changed!", null, false);

            console.log("Success!");
        }, (error) => {
            // Auth issue, force re-login
            if (error.status === 401) {
                console.log("Invalid user/session. Please log-in again...");
                $window.location.href = "/index.html?code=401";
            } else {
                // 
                console.log("Failed to update image name : ", error.data);
                $scope.log("Failed to update image name!", null, false);
            };
        });
    };

    // Update image name
    $scope.deleteImage = (project, image) => {
        var confirmed = $window.confirm("Are you sure you want to delete " + image.name + " from " + project.name + " ?");
        $scope.log("Deleting selected image!", null, true);
        if (confirmed) {
            // alert("Project : " + project._id + ", Image : " + image._id + ", New Name : " + image.name);
            $http.delete("/api/projects/" + project._id + "/images/" + image._id).then((response) => {
                console.log("Managed to delete image!");
                // Set project to local
                $scope.selectedProject = response.data;

                // Update project size
                // Move to backend TODO: @sg on 26th Nov.
                let projImageSize = 0;
                $scope.selectedProject.images.forEach((image) => {
                    console.log(image.size);
                    projImageSize += image.size;
                })
                $scope.selectedProject["size"] = projImageSize;

                // Set the project as choosen
                $scope.choose($scope.selectedProject);
                $scope.log("Selected image deleted!");
            }, (error) => {
                // Auth issue, force re-login
                if (error.status === 401) {
                    console.log("Invalid user/session. Please log-in again...");
                    $window.location.href = "/index.html?code=401";
                } else {
                    // 
                    $scope.log("Failed to delete selected image!");
                    alert("Failed to delete image!" + error.data);
                };
            });
        }
    };

    $scope.getURL = (url) => {
        console.log("Project : " + url);
        let purl = "http://" + $window.location.hostname + ':' + $window.location.port + '/view/' + url;
        $window.open(purl, "_blank");
        //prompt("Copy and paste the below URL into your brower!", purl);
    };

    $scope.getVersion();
    $scope.list();
});