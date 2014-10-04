var UserController = require("./app/controllers/UserController");
var PostController = require("./app/controllers/PostController");

var router = function(app) {
    // index
    app.get('/', function(req, res) {
      res.render('index', function(err, html) {
      
      });
    });

    // User REST routes
    app.post('/user', UserController.addUser);
    app.get('/user/:userid', UserController.getUser);
    app.post('/user/:userid', UserController.updateUser);

    // Post REST routes
    app.post('/post', PostController.addPost);
    app.get('/post/:postid', PostController.getPost);
    app.post('/post/:postid', PostController.updatePost);

    // Post aggregate REST routes
    app.get('/posts/:userid', PostController.getPostsUserID);
};

module.exports = router;