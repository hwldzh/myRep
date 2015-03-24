var mlog = require('cloud/mlog');
var muser = require('cloud/muser');
var util = require('util');
var mutil = require('cloud/mutil');

var msgTypeText = -1;
var msgTypeImage = -2;
var msgTypeAudio = -3;
var msgTypeLocation = -5;

function messageReceived(req, res) {
  //mlog.logObject(req.params,true);
  res.success();
}

function getPushMessage(params, user) {
  var contentStr = params.content;
  var json = {
    badge: "Increment",
    sound: "default"
  };
  var msg = JSON.parse(contentStr);
  var msgDesc = getMsgDesc(msg);
  var name = user.get('username');
  json.alert = name + ' : ' + msgDesc;
  return JSON.stringify(json);
}

function getMsgDesc(msg) {
  var type = msg._lctype;
  if (type == msgTypeText) {
    if (/\\u1f[a-z0-9]{3}/.test(msg._lctext)) {
      return "表情";
    } else {
      return msg._lctext;
    }
  } else if (type == msgTypeImage) {
    return "图片";
  } else if (type == msgTypeAudio) {
    return "声音";
  } else if (type == msgTypeLocation) {
    return msg._lctext;
  } else {
    return msg;
  }
}

function _receiversOffLine(params) {
  var p = new AV.Promise();
  muser.findUserById(params.fromPeer).then(function (user) {
    var msg = getPushMessage(params, user);
    p.resolve({pushMessage: msg});
  }, mutil.rejectFn(p));
  return p;
}

function receiversOffline(req, res) {
  if (req.params.conversationId) {
    // api v2
    _receiversOffLine(req.params).then(function (result) {
      res.success(result);
    }, function (error) {
      console.log(error.message);
      res.success();
    });
  } else {
    res.success();
  }
}

exports.messageReceived = messageReceived;
exports.receiversOffline = receiversOffline; // used by main.js
exports._receiversOffLine = _receiversOffLine;
exports.getPushMessage = getPushMessage;
