var UserController = require("./app/controllers/UserController");
var PostController = require("./app/controllers/PostController");
var VenmoController = require("./app/controllers/VenmoController");

var router = function(app) {

    // User REST routes
    app.post('/user', UserController.addUser);
    app.get('/user/:userid', UserController.getUser);
    app.post('/user/:userid', UserController.updateUser);

    // Post REST routes
    app.post('/post', PostController.addPost);
    app.get('/post/:postid', PostController.getPost);
    app.post('/post/:postid', PostController.updatePost);

    // Post aggregate REST routes
    app.get('/posts', PostController.getPosts);

    // Venmo WebHook
    app.get('/venmo', VenmoController.venmoVerify);
    app.post('/venmo', VenmoController.venmoWebHook);

//    app.get('/clean', UserController.clean);
};

module.exports = router;
