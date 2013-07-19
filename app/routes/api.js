var jsonrpc = require('../api/jsonrpc')

var dcase = require('../api/dcase')
var rec = require('../api/rec')
jsonrpc.add('version', function (params, userId, callback) {
    callback.onSuccess('version 1.0');
});
jsonrpc.addModule(dcase);
jsonrpc.addModule(rec);
exports.httpHandler = jsonrpc.httpHandler;
