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
    copayers: [{userid: String, amount_paid: Number}]
});

// Create Model
var userModel = mongoose.model("users", userSchema);
var postModel = mongoose.model("posts", postSchema);

// Connect mongoDB
var connected = false;
var connectToMongoDB = function() {
    if (!connected) {
        var path = (process.env.DATABASE_URL || process.env.MONGOHQ_URL) + "/wepay";
        mongoose.connect(path);
        mongoose.connection.on("error", console.error.bind("[Model] Connection Failed: "));
        mongoose.connection.once("open", function() {
            console.log("[Model] Connection Success!!! PATH: %s", path);
            connected = true;
        });
    }
};

var apnConnection = new apn.Connection({
    pfx: __dirname + '/private'
});

// Helper Functions
var mergeUser = function(user, update) {
    // assume no duplicate
    if (update.user_posts !== undefined || update.user_posts !== null) {
        user.user_posts = user.user_posts.concat(update.user_posts);
    }
    if (update.copayer_posts !== undefined || update.copayer_posts !== null) {
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
exports.addUser = function(user, callback) {
    connectToMongoDB();

    // Just to be safe
    var _user = {
        userid: user.userid,
        name: user.name,
        venmo_username: user.venmo_username,
        user_posts: [],
        copayer_posts: []
    };

    userModel.find({userid: _user.userid}, function(err, user) {
        if (user != [] || user != null || user != undefined) {
            console.log("[Model] User already exists: %s", user);
            if (callback) {
                callback(user)
            }
        } else {
            userModel.create(_user, function(err, new_user) {
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


};

exports.getUser = function(userid, callback) {
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
        if (callback) {
            // null Case handled in controller
            callback(user);
        }
    });
};

exports.addPost = function(post, callback) {
    connectToMongoDB();

    copayers = [];
    for (userid in post.copayers) {
      copayers.push({
        userid: userid,
        amount_paid: 0
      });
    }

    var _post = {
        postid: uuid.v4(),
        userid: post.userid,
        title: post.title,
        money_requested: post.money_requested,
        copayers: copayers
    };

    postModel.create(_post, function(err, new_post) {
        if (err) {
            console.error.bind("[Model] Creating Post Failed: ")
        }
        console.log("[Model] Post Created: %s", new_post);

        exports.updateUser({userid: _post.userid, user_posts: [_post.postid]}, function(user) {
            console.log("[Model] User Updated for New Post");
            if (callback) {
                callback(new_post);
            }
        });
    });
};

exports.getPost = function(postid, callback) {
    connectToMongoDB();

    postModel.find({postid: postid}, function(err, post) {
        if (err) {console.error.bind("[Model] Getting Post by postid Failed: ")}
        if (post) {
            console.log("[Model] Post by PostID %s Found: %s", postid, post);
        } else {
            console.log("[Model] Post Not Found!");
        }
        if (callback) {
            // null Case handled in controller
            callback(post);
        }
    });
};

exports.getPostsUserID = function(userid, callback) {
    connectToMongoDB();

    postModel.find({userid: userid}, function(err, posts) {
        if (err) {console.error.bind("[Model] Getting Posts by userid Failed: ")}
        if (posts) {
            console.log("[Model] Posts by ID %s Found: %s", userid, posts);
        } else {
            console.log("[Model] Posts Not Found!");
        }
        if (callback) {
            // null Case handled in controller
            callback(posts);
        }
    });
};

exports.getPosts = function(postids, callback) {
    connectToMongoDB();

    postModel.find({postid: { $in: postids }}, function(err, posts) {
      if (err) {
        console.error('[Model] Error occured while fetching posts; postids: %s', JSON.stringify(postids));
      } else {
        console.log('[Model] Successfully fetched posts; posts: %s', JSON.stringify(posts));
        if (callback) {
          callback(posts);
        }
      }
    });
};

exports.updateUser = function(update, callback) {
    // only update user_posts & copayer_posts
    exports.getUser(update.userid, function(user) {
        if (user) {
            user = user[0];
            console.log("[Model] Applying update: %s", JSON.stringify(update));
            user = mergeUser(user, update);
            console.log("[Model] User merged as %s", user);
            var newUpdate = {
                user_posts: user.user_posts,
                copayer_posts: user.copayer_posts
            };
            userModel.findOneAndUpdate({userid: update.userid}, newUpdate, function(err, numberAffected, raw) {
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
            console.error("[Model] User does not exist");
        }
    })
};

var pushNotification = function(post) {
  // TODO: Implement push notifications
};

exports.updatePost = function(update, callback) {
    // only update title & money_requested & copayers
    exports.getPost(update.postid, function(post) {
        if (post) {
            post = post[0];
            post = mergePost(post, update);
            console.log("[Model] Post merged as %s", post);
            newUpdate = {
                title: post.title,
                money_requested: post.money_requested,
                copayers: post.copayers
            };
            postModel.findOneAndUpdate({postid: update.postid}, newUpdate, function(err, numberAffected, raw) {
                if (err) {
                    console.error.bind("[Model] Error occurs while updating: ");
                } else {
                    console.log("[Model] %s data has been updated", numberAffected);
                    console.log("[Model] mongoDB response: %s", raw);

                    pushNotification(post)

                    if (callback) {
                        callback(post);
                    }
                }
            });
        } else {
            console.error("[Model] Post does not exist");
        }
    });
};

exports.clean = function(callback) {
    userModel.remove({}, function() {
        postModel.remove({}, function() {
            console.log("[Model] All data deleted");
            if (callback) callback();
        })
    });
};
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
/*exports.unit_testing = function() {
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

                        exports.updatePost({postid: first_post.postid, title: "hey! post updated!", money_requested: 1500, copayers: [{userid: "facebook123456", amount_paid: 300}]}, function(post) {
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
};*/
