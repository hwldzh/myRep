/**
 * Created by lzw on 14/11/20.
 */
var common = require('cloud/common.js');
var mlog = require('cloud/mlog');

APPID = AV.applicationId;
MASTER_KEY = AV.masterKey;

function _sign(peer_id, watch_ids, super_peer) {
  watch_ids.sort();
  var ts = parseInt(new Date().getTime() / 1000);
  var nonce = common.getNonce(5);
  var msg = [APPID, peer_id, watch_ids.join(':'), ts, nonce].join(':');
  if (super_peer) {
    msg = msg + ':sp';
  }
  var sig = common.sign(msg, MASTER_KEY);
  return {"nonce": nonce, "timestamp": ts, "signature": sig};
}

function sign(request, response) {
  var peer_id = request.params['self_id'];
  var watch_ids = request.params['watch_ids'] || [];
  var super_peer = request.params['sp']; //super power
  var result = _sign(peer_id, watch_ids, super_peer);
  response.success(result);
}

function _groupSign(peer_id, group_id, group_peer_ids, action) {
  group_peer_ids.sort();
  var ts = parseInt(new Date().getTime() / 1000);
  var nonce = common.getNonce(5);
  msg = [APPID, peer_id, group_id, group_peer_ids.join(':'), ts, nonce, action].join(':');
  sig = common.sign(msg, MASTER_KEY);
  return {"nonce": nonce, "timestamp": ts, "signature": sig};
}

function groupSign(request, response) {
  var peer_id = request.params['self_id'];
  var group_id = request.params['group_id'];
  var group_peer_ids = request.params['group_peer_ids'] || [];
  // 组操作的行为，值包含 'join', 'invite', 'kick'
  var action = request.params['action'];
  var result = _groupSign(peer_id, group_id, group_peer_ids, action);
  response.success(result);
}

function _convSign(selfId, convid, targetIds, action) {
  if (targetIds == null) {
    targetIds = [];
  }
  targetIds.sort();
  var ts = parseInt(new Date().getTime() / 1000);
  var nonce = common.getNonce(5);
  var content;
  if (convid) {
    content = [APPID, selfId, convid, targetIds.join(':'), ts, nonce].join(':');
  } else {
    content = [APPID, selfId, targetIds.join(':'), ts, nonce].join(':');
  }

  if (action) {
    content += ':' + action;
  }
  //console.log('content=' + content);
  var sig = common.sign(content, MASTER_KEY);
  return {"nonce": nonce, "timestamp": ts, "signature": sig};
}

function convSign(request, response) {
  var selfId = request.params['self_id'];
  var convid = request.params['convid'];
  var targetIds = request.params['targetIds'];
  var action = request.params['action'];
  var result = _convSign(selfId, convid, targetIds, action);
  response.success(result);
}

module.exports = {
  _sign: _sign,
  _groupSign: _groupSign,
  sign: sign,
  groupSign: groupSign,
  _convSign: _convSign,
  convSign: convSign
};