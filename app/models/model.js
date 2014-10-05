var mongoose = require("mongoose");
var apn = require('apn');
var uuid = require('node-uuid');

// Specify Schema
var userSchema = mongoose.Schema({
    userid: String,
    name: String,
    venmo_username: String,
    user_posts: [String], // Array of postids
    copayer_posts: [String] // Array of postids
});

var postSchema = mongoose.Schema({
    postid: String,
    userid: String,
    title: String,
    name: String,
    money_requested: Number,
    copayers: [{userid: String, name: String, amount_paid: Number}] // Array of userid
});

var deviceSchema = mongoose.Schema({
    userid: String,
    device_token: String
});

// Create Model
var userModel = mongoose.model("users", userSchema);
var postModel = mongoose.model("posts", postSchema);
var deviceModel = mongoose.model("devices", deviceSchema);

// Connect mongoDB
var connected = false;
var connectToMongoDB = function(callback, obj, next) {
    if (!connected) {
        var path = process.env.MONGOHQ_URL + "/wepay";
//        var path = "mongodb://localhost/wepay";
        console.log("Try Connecting %s", path);
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
    cert: process.env.CERT,
    key: process.env.KEY,
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
    if (update.name) {
        post.name = update.name;
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
        var copayers = [];
        if (post.copayers != null && post.copayers != undefined && post.copayers.length != 0) {
            for (copayer in post.copayers) {
                copayers.push({
                    userid: copayer.userid,
                    name: copayer.name,
                    amount_paid: copayer.amount_paid
                });
            }
        }
        if (post.userid == [] || post.userid == "" || post.userid == null || post.userid == undefined || post.userid == "0" || post.userid == "1") {
            console.error("[Model] Catastrophic Error: userid not valid");
        } else {
            console.log("[Model] Creating post for userid %s", post.userid);
        }

        var _post = {
            postid: uuid.v4(),
            userid: post.userid,
            name: post.name,
            title: post.title,
            money_requested: post.money_requested,
            copayers: copayers
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

exports.registerDevice = function (device, callback) {
    if (!connected) {
        connectToMongoDB(exports.registerDevice, device, callback);
    } else {
        // Just to be safe
        var _device = {
            userid: device.userid,
            device_token: device.device_token,
        };

        deviceModel.create(_device, function (err, new_device) {
            if (err) {
                console.error.bind("[Model] Creating New Device Failed, device: %s", JSON.stringify(device));
            }
            console.log("[Model] Device Created: %s", JSON.stringify(new_device));
            if (callback) {
                callback(new_device);
            }
        });
    }
};

var getDevices = function(userids, callback) {
  console.log('Fetching Devices by userids: %s...', JSON.stringify(userids));
  if (!connected) {
    connectToMongoDB(getDevices, userids, callback);
  } else {
    deviceModel.find({userid: { $in: userids }}, function (err, devices) {
      if (err) {
        console.error('[Model] Error occured while fetching devices; userids: %s', JSON.stringify(userids));
      } else {
        console.log('[Model] Successfully fetched devices; devices: %s', JSON.stringify(devices));
        if (callback) {
          callback(devices);
        }
      }
    });
  }
};

var pushNotification = function(userids, postid) {
  console.log('[PushNotification] Doing push notification to userids: %s', JSON.stringify(userids));
  getDevices(userids, function (devices) {
    for (device in devices) {
      var notif = new apn.Notification();
      notif.alert = "A friend invited you to help pay for something";
      notif.payload = { postid: postid };

      var dev = new apn.Device(device.device_token);

      apnConnection.pushNotification(notif, dev);
    }
  });
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
                    name: post.name,
                    copayers: post.copayers
                };
                postModel.findOneAndUpdate({postid: update.postid}, newUpdate, function (err, numberAffected, raw) {
                    if (err) {
                        console.error.bind("[Model] Error occurs while updating: ");
                    } else {
                        console.log("[Model] %s data has been updated", numberAffected);
                        console.log("[Model] mongoDB response: %s", raw);

                        var newCopayers = update.copayers;
                        if (newCopayers) {
                          var onlyUserIds = [];
                          for (copayer in newCopayers) {
                            if (copayer) {
                              onlyUserIds.push(copayer.userid);
                            }
                          }
                          if (onlyUserIds) {
                            pushNotification(onlyUserIds, update.postid);
                          }
                        }

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

exports.registerDevice = function(device, callback) {
    console.log(device);
    callback(device);
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

//Testing
//exports.addUser({id: "id", name: "name"}, function(data1) {
//    exports.getUser = function(data2){
//        console.log("Test1 %s", data1 == data2);
//        exports.addPost({userid: "id", name: "name", title: "title", money_requested: 100,
//            function(data) {
//
//
//        }
//    };
//});
