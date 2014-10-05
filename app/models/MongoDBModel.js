var mongoose = require("mongoose");
var apn = require('apn');
var uuid = require('node-uuid');

// Specify Schema
var userSchema = mongoose.Schema({
    userid: String,
    name: String,
    venmo_username: String,
    user_posts: [String],
    copayer_posts: [String]
});

var postSchema = mongoose.Schema({
    postid: String,
    userid: String,
    title: String,
    money_requested: Number,
    copayers: [String]
});

// Create Model
var userModel = mongoose.model("users", userSchema);
var postModel = mongoose.model("posts", postSchema);

// Connect mongoDB
var connected = false;
var connectToMongoDB = function(callback, obj, next) {
    if (!connected) {
        var path = process.env.MONGOHQ_URL + "/wepay";
        console.log("Try Connecting %s", path);
        //var path = "mongodb://localhost/wepay";
        mongoose.connect(path);
        mongoose.connection.on("error", function() {
            console.error.bind("[Model] Connection Failed: ");
            connected = false;
        });
        mongoose.connection.once("open", function() {
            console.log("[Model] Connection Success!!! PATH: %s", path);
            connected = true;
            if (callback) {
                callback(obj, next);
            } else {
                console.error("[Model] No Callback Specified");
            }
        });
    }
};

var apnConnection = new apn.Connection({
    pfx: __dirname + '/private'
});

// Helper Functions
var mergeUser = function(user, update) {
    // assume no duplicate
    console.log("[Model] Merge start with: %s", JSON.stringify(user));
    if (update.user_posts !== undefined || update.user_posts !== null) {
        user.user_posts = user.user_posts.concat(update.user_posts);
    }
    if (update.copayer_posts !== undefined || update.copayer_posts !== null) {
        user.copayer_posts = user.copayer_posts.concat(update.copayer_posts);
    }
    console.log("[Model] Merge end with: %s", JSON.stringify(user));
    return user;
};
var mergePost = function(post, update) {
    console.log("[Model] Merge start with: %s", JSON.stringify(post));
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
    console.log("[Model] Merge end with: %s", JSON.stringify(post));
    return post;
};

// Methods to Export
exports.addUser = function(user, callback) {
    if (!connected) {
        connectToMongoDB(exports.addUser, user, callback);
    } else {
        // Just to be safe
        var _user = {
            userid: user.userid,
            name: user.name,
            venmo_username: user.venmo_username,
            user_posts: [],
            copayer_posts: []
        };

        console.log("[Model] Looking up %s", JSON.stringify({userid: _user.userid}));
        userModel.find({userid: _user.userid}, function (err, user) {
            if (user != null && user != undefined && user.length != 0) {
                console.log("[Model] User already exists: %s", JSON.stringify(user));
                if (callback) {
                    callback(user)
                }
            } else {
                userModel.create(_user, function (err, new_user) {
                    if (err) {
                        console.error.bind("[Model] Creating New User Failed: ")
                    }
                    console.log("[Model] User Created: %s", new_user);
                    if (callback) {
                        callback(new_user);
                    }
                });
            }
        });
    }


};

exports.getUser = function(userid, callback) {
    if (!connected) {
        connectToMongoDB(exports.getUser, userid, callback);
    } else {
        console.log("[Model] Finding User with ID %s", userid);
        userModel.find({userid: userid}, function (err, user) {
            if (err) {
                console.error.bind("[Model] Getting User Failed: ")
            }
            if (user != null && user != undefined && user.length != 0) {
                console.log("[Model] User by ID %s Found: %s", userid, JSON.stringify(user));
            } else {
                console.error("[Model] User Lost! %s", JSON.stringify(user));
            }
            if (callback) {
                // null Case handled in controller
                console.log("[Model] Calling back user %s", JSON.stringify(user));
                callback(user);
            }
        });
    }
};

exports.addPost = function(post, callback) {
    if (!connected) {
        connectToMongoDB(exports.addPost, post, callback);
    } else {
//        var copayers = [];
//        if (post.copayers != null && post.copayers != undefined && post.copayers.length != 0) {
//            for (userid in post.copayers) {
//                copayers.push({
//                    userid: userid,
//                    amount_paid: 0
//                });
//            }
//        }
        if (post.userid == [] || post.userid == "" || post.userid == null || post.userid == undefined || post.userid == "0" || post.userid == "1") {
            console.error("[Model] Catastrophic Error: userid not valid");
        } else {
            console.log("[Model] Creating post for userid %s", post.userid);
        }

        var _post = {
            postid: uuid.v4(),
            userid: post.userid,
            title: post.title,
            money_requested: post.money_requested,
            copayers: post.copayers
        };

        console.log("[Model] _post ready to be saved: %s", JSON.stringify(_post));
        postModel.create(_post, function (err, new_post) {
            if (err) {
                console.error.bind("[Model] Creating Post Failed: ")
            } else {
                console.log("[Model] Post Created: %s", JSON.stringify(new_post));

                exports.updateUser({userid: _post.userid, user_posts: [_post.postid]}, function (user) {
                    console.log("[Model] User %s Updated for New Post", JSON.stringify(user));
                    if (callback) {
                        callback(new_post);
                    }
                });
            }
        });
    }
};

exports.getPost = function(postid, callback) {
    if (!connected) {
        connectToMongoDB(exports.getPost, postid, callback);
    } else {
        postModel.find({postid: postid}, function (err, post) {
            if (err) {
                console.error.bind("[Model] Getting Post by postid Failed: ")
            }
            if (post != null && post != undefined && post.length != 0) {
                console.log("[Model] Post by PostID %s Found: %s", postid, post);
            } else {
                console.error("[Model] Post Not Found!");
            }
            if (callback) {
                // null Case handled in controller
                callback(post);
            }
        });
    }
};

exports.getPostsUserID = function(userid, callback) {
    if (!connected) {
        connectToMongoDB(exports.getPostsUserID, userid, callback);
    } else {
        postModel.find({userid: userid}, function (err, posts) {
            if (err) {
                console.error.bind("[Model] Getting Posts by userid Failed: ")
            }
            if (posts != null && posts != undefined && posts.length != 0) {
                console.log("[Model] Posts by ID %s Found: %s", userid, JSON.stringify(posts));
            } else {
                console.log("[Model] Posts Not Found!");
            }
            if (callback) {
                // null Case handled in controller
                callback(posts);
            }
        });
    }
};

exports.getPosts = function(postids, callback) {
    if (!connected) {
        connectToMongoDB(exports.getPosts, postids, callback);
    } else {
        postModel.find({postid: { $in: postids }}, function (err, posts) {
            if (err) {
                console.error('[Model] Error occured while fetching posts; postids: %s', JSON.stringify(postids));
            } else {
                console.log('[Model] Successfully fetched posts; posts: %s', JSON.stringify(posts));
                if (callback) {
                    callback(posts);
                }
            }
        });
    }
};

exports.updateUser = function(update, callback) {
    if (!connected) {
        connectToMongoDB(exports.updateUser, update, callback);
    } else {
        // only update user_posts & copayer_posts
        console.log("[Model] Finding User: %s", update.userid);
        exports.getUser(update.userid, function (user) {
            if (user != null && user != undefined && user.length != 0) {
                user = user[0];
                console.log("[Model] Applying update: %s", JSON.stringify(update));
                user = mergeUser(user, update);
                console.log("[Model] User merged as %s", user);
                var newUpdate = {
                    user_posts: user.user_posts,
                    copayer_posts: user.copayer_posts
                };
                userModel.findOneAndUpdate({userid: update.userid}, newUpdate, function (err, numberAffected, raw) {
                    if (err) {
                        console.error.bind("[Model] Error occurs while updating: ");
                    } else {
                        console.log("[Model] %s data has been updated", numberAffected);
                        console.log("[Model] mongoDB response: %s", raw);
                        if (callback) {
                            console.log("[Model] Try to call Callback in findOneAndUpdate");
                            callback(user);
                        }
                    }
                });
            } else {
                console.error("[Model] User does not exist %s %s", user, JSON.stringify(user));
            }
        })
    }
};

var pushNotification = function(post) {
  // TODO: Implement push notifications
};

exports.updatePost = function(update, callback) {
    // only update title & money_requested & copayers
    if (!connected) {
        connectToMongoDB(exports.updatePost, update, callback);
    } else {
        exports.getPost(update.postid, function (post) {
            if (post != null && post != undefined && post.length != 0) {
                post = post[0];
                post = mergePost(post, update);
                console.log("[Model] Post merged as %s", post);
                newUpdate = {
                    title: post.title,
                    money_requested: post.money_requested,
                    copayers: post.copayers
                };
                postModel.findOneAndUpdate({postid: update.postid}, newUpdate, function (err, numberAffected, raw) {
                    if (err) {
                        console.error.bind("[Model] Error occurs while updating: ");
                    } else {
                        console.log("[Model] %s data has been updated", numberAffected);
                        console.log("[Model] mongoDB response: %s", raw);

                        pushNotification(post);

                        if (callback) {
                            callback(post);
                        }
                    }
                });
            } else {
                console.error("[Model] Post does not exist");
            }
        });
    }
};

//exports.clean = function(callback) {
//    userModel.remove({}, function() {
//        postModel.remove({}, function() {
//            console.log("[Model] All data deleted");
//            if (callback) callback();
//        })
//    });
//};
//
//exports.findAll = function(callback) {
//    userModel.find({}, function(err, data1) {
//        postModel.find({}, function(err, data2) {
//            console.log("[Model] All data are here: %s, %s", data1, data2);
//            if (callback) callback(data1, data2);
//        })
//    });
//};

// Testing
//exports.unit_testing = function() {
//    var steve = {
//        userid: "facebook123456",
//        name: "Steve Jobs",
//        user_posts: [],
//        copayer_posts: []
//    };
//    var first_post = {
//        postid: "steve789",
//        userid: "facebook123456",
//        title: "hey! first post!",
//        money_requested: 1000,
//        copayers: []
//    };
//    var second_post = {
//        postid: "steve102",
//        userid: "facebook123456",
//        title: "hey! second post!",
//        money_requested: 2000,
//        copayers: []
//    };
//    exports.addUser(steve, function(user) {
//        var errors = 0;
//        if (steve == user) {
//            console.log("[Test] 1 addUser Callback works");
//        } else {
//            console.log("[Test] 1 addUser Callback error: %s != %s", JSON.stringify(steve), user);
//            errors++;
//        }
//
//        exports.getUser(steve.userid, function (user) {
//            if (JSON.stringify(steve) == user[0]) {
//                console.log("[Test] 2 getUser returns same object");
//            } else {
//                console.log("[Test] 2 getUser Callback error: %s != %s", JSON.stringify(steve), user[0]);
//                errors++;
//            }
//
//            exports.addPost(first_post, function (post) {
//                if (JSON.stringify(first_post) == post) {
//                    console.log("[Test] 3 addPost returns same object");
//                } else {
//                    console.log("[Test] 3 addPost Callback error: %s != %s", JSON.stringify(first_post), post);
//                    errors++;
//                }
//
//                exports.getPost(first_post.postid, function (post) {
//                    if (JSON.stringify(first_post) == post[0]) {
//                        console.log("[Test] 4 getPost returns same object");
//                    } else {
//                        console.log("[Test] 4 getPost Callback error: %s != %s", JSON.stringify(first_post), post);
//                        errors++;
//                    }
//
//                    exports.getUser(steve.userid, function (user) {
//                        console.log("[Test] user from call back is %s", JSON.stringify(user));
//                        if (user[0].user_posts.length == 1) {
//                            console.log("[Test] 5 addPost & updateUser update the user properly");
//                        } else {
//                            console.log("[Test] 5 addPost did not update the user properly or updateUser did not work");
//                            errors++;
//                        }
//
//                        exports.updatePost({postid: first_post.postid, title: "hey! post updated!", money_requested: 1500, copayers: [
//                            {userid: "facebook123456", amount_paid: 300}
//                        ]}, function (post) {
//                            console.log("[Model] This is post: %s", post);
//                            if (post.title == "hey! post updated!" && post.money_requested == 1500 && post.copayers[0].userid == "facebook123456" && post.copayers[0].amount_paid == 300) {
//                                console.log("[Test] 6 updatePost is working");
//                            } else {
//                                console.log("[Test] 6 updatePost is not working: %s", post);
//                                errors++;
//                            }
//                            exports.addPost(second_post, function (post) {
//                                exports.getPostsUserID(steve.userid, function (posts) {
//                                    if (posts.length == 2) {
//                                        console.log("[Test] 7 getPostsUserID is working");
//                                    } else {
//                                        console.log("[Test] 7 getPostsUserID is not working, posts: %s", posts);
//                                        errors++;
//                                    }
//                                    console.log("[Test] Test Ends");
//                                    if (errors == 0) {
//                                        console.log("[Test] There is no error. Congrats!");
//                                        return 0;
//                                    } else {
//                                        console.log("[Test] There are %s errors. Please go back!", errors);
//                                        return 0;
//                                    }
//                                })
//                            })
//                        })
//                    })
//                })
//            })
//        });
//    })
//};
//
//exports.unit_testing();
