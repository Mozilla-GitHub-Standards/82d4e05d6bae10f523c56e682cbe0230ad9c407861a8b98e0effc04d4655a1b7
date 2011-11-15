
var hbase = require('hbase');
var crypto = require('crypto');
var db = hbase({
    host: '127.0.0.1',
    port: 8080
});

db.getVersion(function(err, version) {
   console.log(version); 
});

function hashUser(user) {
    // Use Skein insteaf of SHA-1?
    var sha = crypto.createHash('sha1');
    sha.update(user);
    return sha.digest('hex');
}

/* Data layout:
 *  
 *  One table per "consumer" of sauropod, identified by the domain name
 *  of the application. This must match the "audience" in the BrowserID
 *  assertion issued.
 *
 *  One row per user. Hashed by hashUser(). We start out with one
 *  predefined column family "key:" and the actual key requested
 *  by the application is suffixed as a column qualifier.
 *
 * More discussion on:
 * https://groups.google.com/group/sauropod/browse_thread/thread/f4711de98ddabe3e
 */

function put(user, audience, key, value, cb) {
    var row = db.getRow(audience, hashUser(user));
    row.put("key:" + key, value, function(err, success) {
        cb(err);
    });
}

function get(user, audience, key, cb) {
    var row = db.getRow(audience, hashUser(user));
    row.get("key:" + key, function(err, success) {
       cb(err, success); 
    });
}

exports.put = put;
exports.get = get;
