var mongoose = require("mongoose");

// Specify Schema
var userSchema = mongoose.Schema({
    ID: String,
    name: String,
    posts: [String]
});

var postSchema = mongoose.Schema({
    postID: String,
    ID: String,
    title: String,
    money: Number,
    copayers: [{ID: String, paid: Number}]
});

// Create Model
var userModel = mongoose.model("users", userSchema);
var postModel = mongoose.model("posts", postSchema);

// Connect mongoDB
var connected = false;

var connectToMongoDB = function() {
    if (!connected) {
        mongoose.connect("mongodb://localhost/wepay");
        mongoose.connection.on("error", console.error.bind("[Model] Connection Failed: "));
        mongoose.connection.once("open", function() {
            console.log("[Model] Connection Success");
            connected = true;
        });
    }
};

// Methods to Export

exports.addUser = function(userObj, callBack) {
    connectToMongoDB();

    // Just to be safe
    var _userObj = {
        ID: userObj.ID,
        name: userObj.name,
        posts: userObj.posts
    };

    userModel.create(_userObj, function(err, user) {
        if (err) {
            console.error.bind("[Model] Creating User Failed: ")
        }
        console.log("[Model] User Created: %s", user);
        if (callBack) {
            callBack(user);
        }
    });
};

exports.getUserWithID = function(ID, callBack) {
    connectToMongoDB();

    userModel.find({ID: ID}, function(err, user) {
        if (err) {
            console.error.bind("[Model] Getting User Failed: ")
        }
        if (user) {
            console.log("[Model] User by ID %s Found: %s", ID, user);
        } else {
            console.log("[Model] User Not Found!");
        }
        if (callBack) {
            // null Case handled in controller
            callBack(user);
        }
    });
};

exports.addPost = function(postObj, callBack) {
    connectToMongoDB();

    // Just to be safe
    var _postObj = {
        postID: postObj.postID,
        ID: postObj.ID,
        title: postObj.title,
        money: postObj.money,
        copayers: postObj.copayers
    };

    postModel.create(_postObj, function(err, post) {
        if (err) {
            console.error.bind("[Model] Creating Post Failed: ")
        }
        console.log("[Model] Post Created: %s", post);
        if (callBack) {
            callBack(post);
        }
    });
};

exports.getPostWithPostID = function(postID, callBack) {
    connectToMongoDB();

    postModel.find({postID: postID}, function(err, post) {
        if (err) {console.error.bind("[Model] Getting Post by PostID Failed: ")}
        if (post) {
            console.log("[Model] Post by PostID %s Found: %s", postID, post);
        } else {
            console.log("[Model] Post Not Found!");
        }
        if (callBack) {
            // null Case handled in controller
            callBack(post);
        }
    });
};

exports.getPostsWithID = function(ID, callBack) {
    connectToMongoDB();

    postModel.find({ID: ID}, function(err, post) {
        if (err) {console.error.bind("[Model] Getting Post by ID Failed: ")}
        if (post) {
            console.log("[Model] Posts by ID %s Found: %s", ID, post);
        } else {
            console.log("[Model] Post Not Found!");
        }
        if (callBack) {
            // null Case handled in controller
            callBack(post);
        }
    });
};