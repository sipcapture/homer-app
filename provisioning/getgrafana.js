const uuidv4 = require('uuid/v4');
const fetch = require('node-fetch');
var fs = require("fs");

var GUser = process.env.GUSER || 'admin';
var GPass = process.env.GPASS || 'admin';
var GHost = process.env.GHOST || 'grafana';
var GPort = process.env.GPORT || 3000;
var GGPubIP = process.env.GPUBIP || '127.0.0.1';

const getIP = async function(){
  return new Promise(function(resolve, reject) {
    // Resolve Public IP
    fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(function(json){
	//console.log(json);
	if (json.ip) resolve(json.ip)
	else resolve(GPubIP);
    });
  });
}

const getKey = async function(){
  return new Promise(function(resolve, reject) {
    // Self-Provision a Grafana API key
    let salt = "_" + Math.random().toString(36).substring(7);
    let body = {"name":"homersevenapi"+salt, "role": "Viewer"};
    /*
    fetch('http://'+GUser+':'+GPass+'@'+GHost+':'+GPort+'/api/user/using/1', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(function(json){
	console.log(json);
    });
    */

    fetch('http://'+GUser+':'+GPass+'@'+GHost+':'+GPort+'/api/auth/keys', {
        method: 'post',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(function(json){
	// console.log(json);
	if (json.key) resolve(json.key);
	else resolve('NULL');
    });
  });
}

async function seed(knex, Promise) {

  const tableName = 'global_settings';
  var empty = {};
  var token = await getKey();
  var localIP = await getIP();
  var grafURL='{"host": "http://'+localIP+':'+GPort+'","user": "'+GUser+'","password":"'+GPass+'","token": "'+token+'"}';
  const rows = [
    {
      guid: uuidv4(),
      param: 'grafana',
      partid: 1,
      category: 'search',
      data: grafURL,
      create_date: new Date(),
    }
  ];

  fs.writeFile("/tmp/grafana.json", grafURL, (err) => {
    if (err) console.log(err);
  });
  console.log('Grafana Config',grafURL);
};

seed();
