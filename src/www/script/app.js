var app = angular.module("panomgr", []);

let post_config = {
    "Content-Type": "application/json" 
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
            console.log("DATA: ", data);
            console.log("Status : ", data.status);

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

app.controller("ProjectsController", function($scope, $http){
    
    $scope.status = "Loading...";
    $scope.projects = [];

    // Get list of projects
    $scope.list = () => {
        $http.get("/api/projects", post_config).then((response) => {
            
            // Login success
            console.log("DATA: ", response);
            console.log("Status : ", response.status);

            $scope.projects = response.data;

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

    $scope.validateName = () => {
        console.log("Project Name : ", $scope.newProjectName);
        $http.post("/api/projects", $scope.project, post_config).then((response) => {
            console.log("NEW PROJECT RESPONSE", response);
            alert("New project " + $scope.project.name + " created!");
            $scope.list();

        }, (error) => {
            alert("Failed to create new project " + $scope.project.name + " !!!");
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

    $scope.list();
    // = [
    //     {
    //         "_id": "asd",
    //         "name": "NMJ Works, Kop",
    //         "count": 3,
    //         "active": false
    //     },
    //     {
    //         "_id": "asd2",
    //         "name": "Patil Works, Kop",
    //         "count": 2,
    //         "active": true
    //     },
    //     {
    //         "_id": "asd3",
    //         "name": "Jayant Ent, Kop",
    //         "count": 5,
    //         "active": false
    //     },
    //     {
    //         "_id": "asd4",
    //         "name": "Wayne Ent, Gotham",
    //         "count": 2,
    //         "active": false
    //     }
    // ];
});