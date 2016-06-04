var cookieArr = []; //Array to hold results reuturned by pulse function
var tempArr = [];

function cookieFormat(data) { //Format cookie to look nice when displayed in the browser
    var formattedArr = [];
    for (cookie in data) {
        //Tidy up cookie values
        var cookieName = cookie;
        var cookieValue = data[cookieName];

        if (cookie.indexOf('Date') > -1) { //Format date - this is specific to cookies with date in the name, and will format for Australian timezone
            cookieValue = parseInt(cookieValue, '10');
            cookieValue = new Date(cookieValue);
            cookieValue = cookieValue.toLocaleTimeString("en-AU", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        };

        if (cookie.indexOf('PULSE_') > -1) { cookie = cookie.substring(6) }; //Strip the preceeding 'PULSE_' from the cookie name if its not the uuid
        cookie = cookie.replace(/([A-Z])/g, ' $1').trim(); //Add space before each capital letter
        cookie = cookie.replace(/(?:^|\s)\S/g, function(a) { //Capitalise every word
            return a.toUpperCase();
        });

        var formattedCookie = { 'name': cookie, 'value': cookieValue };
        formattedArr.push(formattedCookie); //Place cookie name and value into object and push to tempArr
    }
    return formattedArr;
}

var pulse = function(data) { //Invoked by the call to the pulse domain - eg ens-mbruty.activate.ensighten.com/jsonp?callback=pulse

    tempArr = tempArr.concat(cookieFormat(data)); //Format all the cookies returned by the pulse call and merge them to tempArr

    //Diff check newly arrived data with existing data
    if (cookieArr.length == 0 || cookieArr.length != tempArr.length) { //if theres no cookies in cookieArr, give it all the cookies in tempArr
        cookieArr = tempArr;
        scope.cookies = cookieArr;
        tempArr = [];
    } else { //if there are already cookie in cookieArr, we need to check them against contents of tempArr
        for (var i = tempArr.length - 1; i >= 0; i--) {
            var timesNotFound = 0;
            var tempCookie = tempArr[i];
            for (var j = 0; j < cookieArr.length; j++) {
                var currentCookie = cookieArr[j];
                if (tempCookie.name == currentCookie.name) {
                    if (tempCookie.value != currentCookie.value) {
                        currentCookie.value = tempCookie.value;
                        break;
                    } else {
                        break;
                    };
                } else {}
            }
        }
        tempArr = [];
    }
    scope.$apply();
    return
};

// Angular time
angular.module('sortApp', []).controller('mainController', function($scope) {

    //Globalise the scope to be accessible to external functions
    var appElement = document.querySelector('[ng-app=sortApp]');
    window.scope = angular.element(appElement).scope();
    
    $scope.activeMonitor = { state: false }; //Determines if 'Actively Monitored' button is selected or deselected
    $scope.activeMonitorToggle = function() { //Function to repeatedly call getData() when 'Actively Monitored' is selected
        this.activeMonitor.state = !this.activeMonitor.state;
        var ms = this.activeMonitor.state;
            if (ms == true) {
                var callData = setInterval(function() {
                    $scope.getData();
                    if (scope.activeMonitor.state == false) { clearInterval(callData); }; //Stop calling getData when 'Actively Monitored' is deselected
                }, 1000);
            };
    };
    $scope.clearData = function() {cookieArr = [];$scope.generateData = 'Generate Data';$scope.cookies = cookieArr;}; //Allows user to clear the data from the screen
    $scope.cookies = cookieArr; //Example format of cookieArr:[{name:'foo',value:'bar'},{name:'displayImpressions',value:'8'}]
    $scope.domain = 'ens-mbruty.activate.ensighten.com'; //Default value for this field
    $scope.generateData = 'Generate Data';
    $scope.getData = function() { //Function which calls the pulse domain and returns any cookies found, causes pulse function to be called
        var domain = $scope.domain;
        var s = document.createElement('script');
        s.type = 'application/x-javascript';
        s.src = '//' + domain + '/jsonp?callback=pulse';
        document.head.appendChild(s);
    };
    $scope.searchCookies = ''; //Set by search value in index.html
    $scope.sortReverse = false; // set the default sort order
    $scope.sortType = 'name'; // set the default sort type
    $scope.trafficBuilder = function(domain){
        trafficBuilder(domain);
        $scope.generateData = 'Generating Data...';
    };  
});