'use strict';

var fs = require('fs');
var path = require('path');
var app = require('express')();

var ddnsPubPem = fs.readFileSync(path.join(__dirname, 'pubkey.pem'), 'ascii');
var ddnsStore = require('../store').create({
  filepath: path.join(__dirname, 'db.sqlite3')
});

require('../').create({
  keypair: { publicKeyPem: ddnsPubPem }
, store: ddnsStore
, prefix: '/api/com.daplie.ddns'
, app: app
});

var plainPort = 3000;
require('http').createServer(app).listen(plainPort, function () {
	console.info('Daplie DDNS RESTful API listening on port', plainPort);
});
