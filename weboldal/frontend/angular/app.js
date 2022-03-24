var app= angular.module('ClickApp',["ngRoute"]);

app.run(function($rootScope, $http){
    $rootScope.title = "ClickType";
    if (sessionStorage.getItem['uID']) {
        $rootScope.loggedIn=true;
        $rootScope.userName=sessionStorage.getItem('uName');
    }
    else{
        $rootScope.loggedIn=false;
    }
});

app.controller('reglogCtrl', function($scope, $rootScope, $http, $location){
    $scope.regist = function() {
        $scope.users = [];
        console.log("anyadat");
        if ($scope.user.name == null || $scope.user.emailreg == null || $scope.passwd1 == null || $scope.passwd2 == null) {
            alert("Nem adtál meg minden adatot!");
        } else {
            if ($scope.passwd1 != $scope.passwd2) {
                alert("A megadott jelszavak nem egyeznek!");
            } else {
                let pattern = /^[a-zA-Z0-9]{8,}$/;
                if (!$scope.passwd1.match(pattern)) {
                    alert("A jelszó nem felel meg a minimális biztonsági kritériumoknak!");
                } else {
                    $http({
                            method: "POST",
                            url: "../backend/API/getOneRecord.php",
                            data: {
                                'table': 'users',
                                'felt': 'email="' + $scope.user.emailreg + '"'
                            }
                        })
                        .then(function(response) {
                            $scope.users = response.data;

                            if ($scope.users.length != 0) {
                                alert("Ez az e-mail cím már regisztrált!");
                            } else {
                                $http({
                                        method: "POST",
                                        url: "../backend/API/insertRecord.php",
                                        data: {
                                            "table": "users",
                                            "values": {
                                                "Email": "'" + $scope.user.emailreg + "'",
                                                "Nev": "'" + $scope.user.name + "'",
                                                "ido": "'0'",
                                                "jelszo": "'" + CryptoJS.SHA1($scope.passwd1) + "'",
                                                "jogosultsag": "'1'"
                                            }
                                        }
                                    })
                                    .then(function(response) {
                                        alert(response.data.message);
                                        $scope.name = "";
                                        $scope.email = "";
                                        $scope.pass1 = "";
                                        $scope.pass2 = "";
                                        //   $location.path('#!/');
                                    });
                            }
                        });
                }
            }
        }
    }

    $rootScope.loggedIn= false;
        $scope.user = {emaillog: "", passwd: ""};
             $scope.login=function(){
                //console.log($scope);
                if ($scope.user.emaillog == "" || $scope.user.passwd == "") {
                    alert('Nem adtad meg a belépési adatokat!');
                }
                else
                {
                    $http({
                        method: "POST",
                        url: "../backend/API/getOneRecord.php",
                        data: {
                            'table': 'users',
                            'felt': 'Email="' + $scope.user.emaillog + '" AND jelszo="' + CryptoJS.SHA1($scope.user.passwd) + '"'
                        }
                    })
                    .then(function (response) {
                        $scope.users=response.data;
                        if ($scope.users.length==0) {
                            alert("Hibás belépési adatok!");
                        } else {
                            $rootScope.loggedIn=true;
                            $rootScope.loggedUser = $scope.user.Nev;
                            sessionStorage.setItem('uID',angular.toJson($scope.users.ID));
                            sessionStorage.setItem('uName',angular.toJson($scope.users.Nev));
                            sessionStorage.setItem('uMail',angular.toJson($scope.users.Email));
                            sessionStorage.setItem('uLoggedIn',angular.toJson($rootScope.loggedIn));
                            sessionStorage.setItem('uJog',angular.toJson($scope.users.jogosultsag));
                            console.log("anyadat")
                            $location.path('#!/');

                        }    
                    })
                }
            }

            $scope.logout = function() {
                console.log('apukad')
                sessionStorage.removeItem('uName');
                $rootScope.loggedUser = "";
                $rootScope.loggedIn = false;
                $location.path('#!/');
            }
        });

app.config(function($routeProvider) {
$routeProvider
    .when('/', {
        templateUrl: 'fooldal.html',
    })
    .when('/reglog', {
        templateUrl: 'belepes.html',
        controller: 'reglogCtrl',
        ID:'belep',
    })
    .when('/forum', {
        resolve: {
            function($location, $rootScope) {
                if (!$rootScope.loggedIn) {
                    $location.path('/');
                }
            }
        },
        templateUrl: 'forum.html',
    })
    .when('/gyik', {
        templateUrl: 'GYIK.html',
    })
    .when('/news', {
        resolve: {
            function($location, $rootScope) {
                if (!$rootScope.loggedIn) {
                    $location.path('/');
                }
            }
        },
        templateUrl: 'hirek.html',
    })
    .when('/aboutus', {
        templateUrl: 'rolunk.html',
    })
    .when('/stats', {
        resolve: {
            function($location, $rootScope) {
                if (!$rootScope.loggedIn) {
                    $location.path('/');
                }
            }
        },
        templateUrl: 'statisztika.html',
        controller: 'statCtrl'
    })
    .when('/download', {
        resolve: {
            function($location, $rootScope) {
                if (!$rootScope.loggedIn) {
                    $location.path('/');
                }
            }
        },
        templateUrl: 'letoltes.html',
    })
});

app.controller('statCtrl', function($scope, $http){
    $scope.user = [];
    $http({
        method: "POST",
        url: "../backend/API/getAllRecords.php",
        data: {
            'whatineed': '',
            'table': 'users',
            'condition': ''
        }
    })
    .then(function (res) {
        $scope.user = res.data;
    })
})