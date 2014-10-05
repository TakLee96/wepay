/**
 * Created by lijiahang on 14-10-4.
 */

var wepayApp = angular.module('wepayApp', []);

wepayApp.controller('wepayCtrl', ['$rootScope', '$interval', function($rootScope, $interval) {
    $rootScope.friends = "";
}]);

wepayApp.controller('FBCtrl', ['$rootScope', function($rootScope) {
    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            console.log("status Connected: %s", response.authResponse.accessToken);
            afterLogIn();
        } else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            console.log("Please log in to Facebook! We need you!");
        } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            console.log("Please log in to Facebook.");
        }
    }

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
    function checkLoginState() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }

    window.fbAsyncInit = function() {
        FB.init({
            appId      : '506898992780959',
            cookie     : true,  // enable cookies to allow the server to access
            // the session
            xfbml      : true,  // parse social plugins on this page
            version    : 'v2.1' // use version 2.1
        });

        // Now that we've initialized the JavaScript SDK, we call
        // FB.getLoginStatus().  This function gets the state of the
        // person visiting this page and can return one of three states to
        // the callback you provide.  They can be:
        //
        // 1. Logged into your app ('connected')
        // 2. Logged into Facebook, but not your app ('not_authorized')
        // 3. Not logged into Facebook and can't tell if they are logged into
        //    your app or not.
        //
        // These three cases are handled in the callback function.

        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });

    };

// Load the SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
    function afterLogIn() {
        console.log('Welcome!  Fetching your information: ');
        FB.api('/me/permissions', function(response) {
            // TODO: the user has successfully logged into FB and wepay
            console.log(JSON.stringify(response));
        });
        FB.api('/me/friends', function(response) {
            // TODO: the user has successfully logged into FB and wepay
            console.log(response.data);
            $rootScope.friends = JSON.stringify(response.data);
        });
    }

    $rootScope.logIn = function() {
        FB.login(function(response) {
            console.log("Log in success %s", JSON.stringify(response));
            afterLogIn();
        }, {scope: 'public_profile, email, user_friends'});
    };

    $rootScope.logOut = function() {
        FB.logout(function(response) {
            // Person is now logged out
            console.log("FB logged out: %s", response);
        });
    }
}]);