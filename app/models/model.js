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
        mongoose.connect((process.env.DATABASE_URL || process.env.MONGOHQ_URL) + "/wepay");
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
    if (update.user_posts != undefined || update.user_posts != null) {
        user.user_posts = user.user_posts.concat(update.user_posts);
    }
    if (update.copayer_posts != undefined || update.copayer_posts != null) {
        user.copayer_posts = user.copayer_posts.concat(update.copayer_posts);
    }
    return user;
};
var mergePost = function(post, update) {
    // assume no duplicate
    if (update.title) {
        post.title = update.title;
    }
    if (update.money_requested != undefined || update.money_requested != null) {
        post.money_requested = update.money_requested;
    }
    if (update.copayers != undefined || update.copayers != null) {
        post.copayers = post.copayers.concat(update.copayers);
    }
    return post;
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

        exports.updateUser(_post.userid, {user_posts: [_post.postid]}, function() {
            console.log("[Model] User Updated for New Post");
            if (callBack) {
                callBack(new_post);
            }
        });
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

    postModel.find({userid: userid}, function(err, posts) {
        if (err) {console.error.bind("[Model] Getting Posts by userid Failed: ")}
        if (posts) {
            console.log("[Model] Posts by ID %s Found: %s", userid, posts);
        } else {
            console.log("[Model] Posts Not Found!");
        }
        if (callBack) {
            // null Case handled in controller
            callBack(posts);
        }
    });
};

exports.updateUser = function(userid, update, callBack) {
    // only update user_posts & copayer_posts
    exports.getUser(userid, function(user) {
        if (user) {
            user = user[0];
            console.log("[Model] Applying update: %s", JSON.stringify(update));
            user = mergeUser(user, update);
            console.log("[Model] User merged as %s", user);
            var newUpdate = {
                user_posts: user.user_posts,
                copayer_posts: user.copayer_posts
            };
            userModel.findOneAndUpdate({userid: userid}, newUpdate, function(err, numberAffected, raw) {
                if (err) {
                    console.error.bind("[Model] Error occurs while updating: ");
                } else {
                    console.log("[Model] %s data has been updated", numberAffected);
                    console.log("[Model] mongoDB response: %s", raw);
                    if (callBack) {
                        console.log("[Model] Try to call Callback in findOneAndUpdate");
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
            newUpdate = {
                title: post.title,
                money_requested: post.money_requested,
                copayers: post.copayers
            };
            postModel.findOneAndUpdate({postid: postid}, newUpdate, function(err, numberAffected, raw) {
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

// Testing
var unit_testing = function() {
    var steve = {
        userid: "facebook123456",
        name: "Steve Jobs",
        user_posts: [],
        copayer_posts: []
    };
    var first_post = {
        postid: "steve789",
        userid: "facebook123456",
        title: "hey! first post!",
        money_requested: 1000,
        copayers: []
    };
    var second_post = {
        postid: "steve102",
        userid: "facebook123456",
        title: "hey! second post!",
        money_requested: 2000,
        copayers: []
    };
    exports.addUser(steve, function(user) {
        var errors = 0;
        if (steve == user) {
            console.log("[Test] 1 addUser Callback works");
        } else {
            console.log("[Test] 1 addUser Callback error: %s != %s", JSON.stringify(steve), user);
            errors++;
        }

        exports.getUser(steve.userid, function(user) {
            if (JSON.stringify(steve) == user[0]) {
                console.log("[Test] 2 getUser returns same object");
            } else {
                console.log("[Test] 2 getUser Callback error: %s != %s", JSON.stringify(steve), user[0]);
                errors++;
            }

            exports.addPost(first_post, function(post) {
                if (JSON.stringify(first_post) == post) {
                    console.log("[Test] 3 addPost returns same object");
                } else {
                    console.log("[Test] 3 addPost Callback error: %s != %s", JSON.stringify(first_post), post);
                    errors++;
                }

                exports.getPost(first_post.postid, function(post) {
                    if (JSON.stringify(first_post) == post[0]) {
                        console.log("[Test] 4 getPost returns same object");
                    } else {
                        console.log("[Test] 4 getPost Callback error: %s != %s", JSON.stringify(first_post), post);
                        errors++;
                    }

                    exports.getUser(steve.userid, function(user) {
                        console.log("[Test] user from call back is %s", JSON.stringify(user));
                        if (user[0].user_posts.length == 1) {
                            console.log("[Test] 5 addPost & updateUser update the user properly");
                        } else {
                            console.log("[Test] 5 addPost did not update the user properly or updateUser did not work");
                            errors++;
                        }

                        exports.updatePost(first_post.postid, {title: "hey! post updated!", money_requested: 1500, copayers: [{userid: "facebook123456", amount_paid: 300}]}, function(post) {
                            console.log("[Model] This is post: %s", post);
                            if (post.title == "hey! post updated!" && post.money_requested == 1500 && post.copayers[0].userid == "facebook123456" && post.copayers[0].amount_paid == 300) {
                                console.log("[Test] 6 updatePost is working");
                            } else {
                                console.log("[Test] 6 updatePost is not working: %s", post);
                                errors++;
                            }
                            exports.addPost(second_post, function(post) {
                                exports.getPostsUserID(steve.userid, function(posts) {
                                    if (posts.length == 2) {
                                        console.log("[Test] 7 getPostsUserID is working");
                                    } else {
                                        console.log("[Test] 7 getPostsUserID is not working, posts: %s", posts);
                                        errors++;
                                    }
                                    console.log("[Test] Test Ends");
                                    if (errors == 0) {
                                        console.log("[Test] There is no error. Congrats!");
                                        return 0;
                                    } else {
                                        console.log("[Test] There are %s errors. Please go back!", errors);
                                        return 0;
                                    }
                                })
                            })
                        })
                    })
                })
            })
        });
    })
};