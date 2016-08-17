'use strict';

// take any input keypair privkey.pem
// and generate an output privkey.pem.pub with only the private key

var fs = require('fs');
var RSA = require('rsa-compat').RSA;
var keypairPath = process.argv[2];
var pubkeyPath = process.argv[3] || (keypairPath + '.pub');

var privkeyPem = fs.readFileSync(keypairPath, 'ascii');
var pubkeyPem = RSA.exportPublicPem({ privateKeyPem: privkeyPem });

fs.writeFileSync(pubkeyPath, pubkeyPem, 'ascii');
