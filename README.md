Daplie DNS API - Dynamic DNS Server for Node.js
======

**STOP:** You probably want [node-ddns](https://github.com/Daplie/node-ddns)

A Dynamic DNS (DDNS / DynDNS) API written in node.js.

This is one distinct part of a 3-part system.

  * node-ddns (full stack demo)
  * node-ddns-api (RESTful HTTP API)
  * node-ddns-frontend (HTML5 Management App)
  * node-ddns-service (UDP DNS Server)

Install
=======

<!--
  npm install -s daplie-dns-api@1.x
-->
```bash
npm install --global rsa-compat

git clone https://github.com/Daplie/node-ddns-api.git
pushd node-ddns-api/
```

Usage
=====

You need to have an rsa keypair. You can generate one (even on Windows) using `rsa-keygen-js`
which is installed with `rsa-compat` in the step above.

```bash
rsa-keygen-js
```

```javascript
'use strict';

var fs = require('fs');
var path = require('path');
var app = require('express')();

var ddnsPubPem = fs.readFileSync(path.join(process.cwd(), 'pubkey.pem'), 'ascii');
var ddnsStore = require('daplie-dns-api/store').create({
  filepath: path.join(process.cwd(), 'db.sqlite3')
});

var ddns = require('daplie-dns-api').create({
  keypair: { publicKeyPem: ddnsPubPem }
, store: ddnsStore
, prefix: '/api/com.daplie.ddns'
, app: app
});

var plainPort = 3000;
require('http').createServer(app).listen(plainPort, function () {
	console.info('Daplie DDNS RESTful API listening on port', plainPort);
});
```

API
---

Each domain record is tied to a specific device.

Whenever a device is updated, all associated records for that device are also updated.

**API Prefix**

The standard API prefix is `/api/com.daplie.ddns`, but this may be changed arbitrarily.
All of the examples below assume `/api/com.daplie.ddns`

**Public**

* `GET /public` returns all records which are publicly visible

```javascript
[
  {
			"createdAt": "1459977507858",
			"device": "localhost",
			"host": "example.daplie.me",
			"id": "o7khWjafqw_2185sxEmWaiBQ42o",
			"name": "example.daplie.me",
			"registered": true,
			"ttl": 300,
			"type": "A",
			"updatedAt": "1459977508125",
			"value": "127.0.0.1",
			"zone": "aj.daplie.me"
	}
]
```

**Authorized**

Authorization happens via JWT token. The JWT contains the following fields:

```javascript
{ "cn": "*.example.com" // example.com, .example.com, *.example.com, www.example.com
}
```

**DNS Records**

* `GET /records` returns all records for which the JWT matches the `cn` field
* `POST /records`
* `DELETE /records/:name/:type/:value/:device?`

**Device Records**

* `POST /devices` accepts `{ name: 'rpi3', addresses: { type: 'A', value: '127.0.0.1' } }`
* `DELETE /devices/:name` delete a device and all attached domain records
* `DELETE /devices/:name/:tld/:sld/:sub?` delete matching domain records from device
* `DELETE /devices/:device/:domain` delete matching domain records from device

**DDNS Updates**

* `POST /ddns` accepts `{ records: [{ registered: true, groupIdx: '...', type: 'A', host: 'sub.domain.tld', value: 127.0.0.1, ttl: 600, }] }`


Install & Configure
-------------------

```bash
# npm
npm install --save ddns-api

# git
git clone git@github.com:Daplie/node-ddns-api.git
```

```bash
# generate keypair
node ./bin/generate-rsa-keypair examples/privkey.pem

# generate public key
node ./bin/keypair-to-public examples/privkey.pem examples/pubkey.pem

# generate signed token
node bin/sign-jwt.js examples/privkey.pem example.com foo-servername
```

```javascript
'use strict';

var fs = require('fs');
var PromiseA = require('bluebird');
var dyndnsApi = require('dyndns-api');
var express = require('express');
var app = express();

var conf = {
  apiBase: '/api/com.daplie.ddns'
, pubkey: fs.readFileSync('examples/pubkey.pem')
};

// You may provide the Storage API however you wish
// (easy to adapt to sql, mongo, rethinkdb, couchdb, etc)
// however, you will find that masterquest-sqlite3
// and masterquest-pg provide the necessary methods
var Domains = {
  upsert: function (id, obj) {
    return new PromiseA(function (resolve) {
      // ...
      resolve();
    });
  }
, find: function (attrs /*null*/, opts /*{ limit: 500 }*/) {
    return new PromiseA(function (resolve) {
      // ...
      resolve([
        { name: '*.example.com'
        , zone: 'example.com'
        , ttl: 600
        , type: 'A' // A, AAAA, ANAME, CNAME, MX, TXT, SRV, FWD, etc
        , value: '127.0.0.1'
        , priority: null // only used for MX
        , device: 'foo-device'
        }
      ]);
    });
  }
};

app.use(require('body-parser').json());

PromiseA.resolve(dyndnsApi.create(conf, { Domains: Domains }, app)).then(function () {
  var server = http.createServer();
  server.on('request', app);
  server.listen(8080, function () {
    console.log(server.address());
  });
});
```

Test that it all works
----------------------

```bash
node example.js
```

```bash
# update a DNS record
JWT=$(node bin/sign-jwt examples/privkey.pem '*.example.com' 'foo-server')
curl http://localhost:8080/api/com.daplie.ddns/ddns \
  -X POST \
  -H 'Authorization: Bearer '$JWT \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '[
        { "name": "example.com"
        , "value": "127.0.0.1"
        , "type": "A"
        , "device": "foo-server"
        // priority
        // ttl
        }
      ]'

# test that the record was updated
curl http://localhost:8080/api/com.daplie.ddns/public
```

LICENSE
=======

Dual-licensed MIT and Apache-2.0

See LICENSE
