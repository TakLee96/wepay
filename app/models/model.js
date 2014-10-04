var mongoose = require("mongoose");

// Specify Schema
var userSchema = mongoose.Schema({
    userid: String,
    name: String,
    user_posts: [String],
    copayer_posts: [String],
});

var postSchema = mongoose.Schema({
    postid: String,
    userid: String,
    title: String,
    money_requested: Number,
    copayers: [{userid: String, amount_paid: Number}]
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

exports.addUser = function(user, callBack) {
    connectToMongoDB();

    // Just to be safe
    var _user = {
        userid: user.userid,
        name: user.name,
        user_posts: [],
        copayer_posts: []
    };

    userModel.create(_user, function(err, new_user) {
        if (err) {
            console.error.bind("[Model] Creating New User Failed: ")
        }
        console.log("[Model] User Created: %s", new_user);
        if (callBack) {
            callBack(new_user);
        }
    });
};

exports.getUser = function(userid, callBack) {
    connectToMongoDB();

    userModel.find({userid: userid}, function(err, user) {
        if (err) {
            console.error.bind("[Model] Getting User Failed: ")
        }
        if (user) {
            console.log("[Model] User by ID %s Found: %s", userid, user);
        } else {
            console.log("[Model] User Not Found!");
        }
        if (callBack) {
            // null Case handled in controller
            callBack(user);
        }
    });
};

exports.addPost = function(post, callBack) {
    connectToMongoDB();

    // Just to be safe
    var _post = {
        postid: post.postid,
        userid: post.userid,
        title: post.title,
        money_requested: post.money_requested,
        copayers: []
    };

    postModel.create(_postObj, function(err, new_post) {
        if (err) {
            console.error.bind("[Model] Creating Post Failed: ")
        }
        console.log("[Model] Post Created: %s", new_post);
        if (callBack) {
            callBack(new_post);
        }
    });
};

exports.getPost = function(postid, callBack) {
    connectToMongoDB();

    postModel.find({postid: postid}, function(err, post) {
        if (err) {console.error.bind("[Model] Getting Post by postid Failed: ")}
        if (post) {
            console.log("[Model] Post by PostID %s Found: %s", postid, post);
        } else {
            console.log("[Model] Post Not Found!");
        }
        if (callBack) {
            // null Case handled in controller
            callBack(post);
        }
    });
};

exports.getPostsUserID = function(userid, callBack) {
    connectToMongoDB();

    postModel.find({userid: userid}, function(err, post) {
        if (err) {console.error.bind("[Model] Getting Post by userid Failed: ")}
        if (post) {
            console.log("[Model] Posts by ID %s Found: %s", userid, post);
        } else {
            console.log("[Model] Post Not Found!");
        }
        if (callBack) {
            // null Case handled in controller
            callBack(post);
        }
    });
};
