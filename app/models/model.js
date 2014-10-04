var mongoose = require("mongoose");

// Specify Schema
var userSchema = mongoose.Schema({
    userid: String,
    name: String,
    user_posts: [String],
    copayer_posts: [String]
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

// Helper Functions
var mergeUser = function(user, update) {
    // assume no duplicate
    if (update.user_posts) {
        user.user_posts.concat(update.user_posts);
    }
    if (update.copayer_posts) {
        user.copayer_posts.concat(update.copayer_posts);
    }
    return user;
};
var mergePost = function(post, update) {
    // assume no duplicate
    if (update.title) {
        post.title = update.title;
    }
    if (update.money_requested) {
        post.money_requested = update.money_requested;
    }
    if (update.copayers) {
        post.copayers.concat(update.copayers);
    }
    return user;
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

    postModel.create(_post, function(err, new_post) {
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

exports.updateUser = function(userid, update, callBack) {
    // only update user_posts & copayer_posts
    exports.getUser(userid, function(user) {
        if (user) {
            user = user[0];
            user = mergeUser(user, update);
            console.log("[Model] User merged as %s", user);
            userModel.update({userid: userid}, user, function(err, numberAffected, raw) {
                if (err) {
                    console.error.bind("[Model] Error occurs while updating: ");
                } else {
                    console.log("[Model] %s data has been updated", numberAffected);
                    console.log("[Model] mongoDB response: %s", raw);
                    if (callBack) {
                        callBack(user);
                    }
                }
            });
        } else {
            console.error("[Model] User does not exist");
        }
    })
};

exports.updatePost = function(postid, update, callBack) {
    // only update title & money_requested & copayers
    exports.getPost(postid, function(post) {
        if (post) {
            post = post[0];
            post = mergePost(post, update);
            console.log("[Model] Post merged as %s", post);
            postModel.update({postid: postid}, post, function(err, numberAffected, raw) {
                if (err) {
                    console.error.bind("[Model] Error occurs while updating: ");
                } else {
                    console.log("[Model] %s data has been updated", numberAffected);
                    console.log("[Model] mongoDB response: %s", raw);
                    if (callBack) {
                        callBack(post);
                    }
                }
            });
        } else {
            console.error("[Model] Post does not exist");
        }
    })
};
