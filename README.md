<!-- AD_TPL_BEGIN -->

About Daplie: We're taking back the Internet!
--------------

Down with Google, Apple, and Facebook!

We're re-decentralizing the web and making it read-write again - one home cloud system at a time.

Tired of serving the Empire? Come join the Rebel Alliance:

<a href="mailto:jobs@daplie.com">jobs@daplie.com</a> | [Invest in Daplie on Wefunder](https://daplie.com/invest/) | [Pre-order Cloud](https://daplie.com/preorder/), The World's First Home Server for Everyone

<!-- AD_TPL_END -->

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

LICENSE
=======

Dual-licensed MIT and Apache-2.0

See LICENSE
