/**
 * Created by lijiahang on 14-10-4.
 */

var wepayApp = angular.module('wepayApp', []);

wepayApp.controller('wepayCtrl', ['$http', '$rootScope', function($http, $rootScope) {
    // fundamental variables
    $rootScope.friends = [];
    $rootScope.myInfo = {};
    $rootScope.logInFinish = false;
    $rootScope.userObj = {};
    $rootScope.posts = [];
    $rootScope.detailPost = {};
    $rootScope.MeNotFriend = true;
    $rootScope.showDetail = false;
    $rootScope.postStart = false;
    $rootScope.showInvitation = false;
    $rootScope.newPost = {title: "", money: 0};
    $rootScope.notifyFriends = {};

    // fundamental functions
    $rootScope.getMyPosts = function() {
        $rootScope.MeNotFriend = true;
        var url1 = "/user/" + $rootScope.myInfo.id;
        console.log(url1);
        $http.get(url1).success(function(data, status, headers, config) {
            $rootScope.userObj = data;
            var url2 = "/posts?postids=";
            for (var i = 0; i < data.user_posts.length - 1; i++) {
                url2 += data.user_posts[i] + ",";
            }
            url2 += data.user_posts[data.user_posts.length - 1];
            console.log(url2);
            $.getJSON(url2).success(function(data) {
                $rootScope.posts = data;
                $rootScope.$apply();
                console.log($rootScope.posts);
            });
        });
    };
    $rootScope.startPost = function() {
        $rootScope.postStart = true;
        $rootScope.$apply();
    };
    $rootScope.getFriendsPosts = function() {
        $rootScope.MeNotFriend = false;
        var url1 = "/user/" + $rootScope.myInfo.id;
        console.log(url1);
        $http.get(url1).success(function(data, status, headers, config) {
            $rootScope.userObj = data;
            var url2 = "/posts?postids=";
            for (var i = 0; i < data.copayer_posts.length - 1; i++) {
                url2 += data.copayer_posts[i] + ",";
            }
            url2 += data.copayer_posts[data.copayer_posts.length - 1];
            console.log(url2);
            $.getJSON(url2).success(function(data) {
                $rootScope.posts = data;
                $rootScope.$apply();
                console.log($rootScope.posts);
            });
        });
    };
    $rootScope.calculateSum = function(arr) {
        if (!arr) return 0;
        var total = 0;
        for (var i = 0; i < arr.length; i++) {
            total += arr[i].amount_paid;
        }
        return total;
    };
    $rootScope.getDetail  = function(post) {
        $rootScope.showDetail = true;
        console.log("Constructing new post: %s", post);
        $rootScope.detailPost = {
            postid: post.postid,
            title: post.title,
            name: $rootScope.myInfo.first_name + " " + $rootScope.myInfo.last_name,
            money_requested: post.money_requested,
            copayers: post.copayers
        };
        $rootScope.$apply();
    };
    $rootScope.goBackToList = function() {
        if ($rootScope.showDetail) $rootScope.showDetail = false;
        if ($rootScope.postStart) $rootScope.postStart = false;
        if ($rootScope.showInvitation) $rootScope.showInvitation = false;
        if ($rootScope.MeNotFriend) {
            $rootScope.getMyPosts();
        } else {
            $rootScope.getFriendsPosts();
        }
        $rootScope.$apply();
    };
    $rootScope.inviteFriends = function() {
        // TODO: Implement inviteFriends
        $rootScope.showDetail = false;
        $rootScope.showInvitation = true;
        $rootScope.notifyFriends = {};
        for (friend in $rootScope.friends) {
            $rootScope.notifyFriends[friend.id] = false;
        }
        console.log(JSON.stringify($rootScope.friends));
        console.log(JSON.stringify($rootScope.notifyFriends));
        $rootScope.$apply();
    };
    $rootScope.contributeMoney = function() {
        alert("Sorry, the developer sucks.");
    };
    $rootScope.makeNewPost = function() {
        $rootScope.$apply();
        var post_obj = {
            userid: $rootScope.myInfo.id,
            name: ($rootScope.myInfo.first_name + " " + $rootScope.myInfo.last_name),
            title: $rootScope.newPost.title,
            money_requested: $rootScope.newPost.money
        };
        console.log("Creating Element %s", JSON.stringify(post_obj));
        $http.post('/post', post_obj).success(function(data) {
            console.log("Created! %s", JSON.stringify(data));
            $rootScope.newPost.title = "";
            $rootScope.newPost.money = 0;
            $rootScope.postStart = false;
            $rootScope.$apply();
        });
    };
    $rootScope.makeInvitation = function() {
        for (friend in $rootScope.friends) {
            if ($rootScope.notifyFriends[friend.id]) {
                var post_obj = {
                    userid: $rootScope.myInfo.id,
                    name: ($rootScope.myInfo.first_name + " " + $rootScope.myInfo.last_name),
                    title: $rootScope.detailPost.title,
                    money_requested: $rootScope.detailPost.money,
                    copayers: [{
                        userid: friend.id,
                        name: friend.first_name + " " + friend.last_name,
                        amount_paid: 0
                    }]
                };
                console.log("Creating Element %s", JSON.stringify(post_obj));
                $http.post('/post/' + $rootScope.detailPost.postid, post_obj).success(function(data) {
                    console.log("Created! %s", JSON.stringify(data));
                    $rootScope.showInvitation = false;
                    $rootScope.$apply();
                });
            }
        }
    }

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
        FB.api('/me', function(response) {
            // TODO: the user has successfully logged into FB and wepay
            console.log(JSON.stringify(response));
            $rootScope.myInfo = response;
        });
        FB.api('/me/permissions', function(response) {
            // TODO: the user has successfully logged into FB and wepay
            console.log(JSON.stringify(response));
        });
        FB.api('/me/friends', function(response) {
            // TODO: the user has successfully logged into FB and wepay
            console.log(response.data);
            $rootScope.friends = JSON.stringify(response.data);
            $rootScope.logInFinish = true;
            $rootScope.$apply();
            $rootScope.getMyPosts();
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