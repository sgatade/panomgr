var app = angular.module("panomgr", []);

app.controller("ProjectsController", function($scope){
    $scope.status = "Loading...";
    $scope.selectedProject = "";
    $scope.projects = [
        {
            "_id": "asd",
            "name": "NMJ Works, Kop",
            "count": 3,
            "active": false
        },
        {
            "_id": "asd2",
            "name": "Patil Works, Kop",
            "count": 2,
            "active": true
        },
        {
            "_id": "asd3",
            "name": "Jayant Ent, Kop",
            "count": 5,
            "active": false
        },
        {
            "_id": "asd4",
            "name": "Wayne Ent, Gotham",
            "count": 2,
            "active": false
        }
    ];
});