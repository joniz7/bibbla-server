const http = require('http');
const request = require('request');
const cheerio = require('cheerio');

var hostname = '127.0.0.1';
var port = 4444;

var html = "<html><body><h1> HELO! </h1>This is a very beautiful webpage</body></html>";

var persons = [
	{name: "Jonathan", age:23},
	{name: "Victor", age:22},
	{name: "Niklas", age:23},
	{name: "Olle", age:62}
];

if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

http.createServer(function(req, res) {
	if(req.method == "GET") {
		if(req.url === "/people") {
			res.writeHead(200, {"Content-Type":"application/javascript"});
			var jsonString = '{"people": [';
			for(var i in persons) {
				jsonString += writeObject(persons[i])+',';
			}
			jsonString = jsonString.slice(0, jsonString.length-1) + ']}';

			res.end("fun("+jsonString+");");
		} else if(req.url.includes("/search/")) {

			//var search = "http://www.gotlib.goteborg.se/search*swe/X?searchtype=X&searcharg=dino&searchscope=6&SUBMIT=S%C3%B6k";


			var searchStr = req.url.substring(req.url.lastIndexOf("/")+1, req.url.length);

			request('http://www.gotlib.goteborg.se/search*swe/X?searchtype=X&searcharg='+searchStr, function(error, response, body){
				if(!error && response.statusCode == 200) {
					res.writeHead(200, {"Content-Type":"text/html"});

					
					$ = cheerio.load(body);
					
					var potBooks = $('.sokresultat');

					var html = "";

					potBooks.each(function(index, elem){
						var auth = $(elem).find('strong').html();
						if(auth != null) {
							html += auth +"\n";	
						}
					});

					res.end($.html());
				} else {
					res.writeHead(404, {"Content-Type":"text/html"});
					res.end("<html><body>We ain't found shit</body></html>");
				}
			});
		} else {
			res.writeHead(200, {"Content-Type":"text/html"});
			res.end(html);
		}
	}
	
}).listen(port, hostname, function() {
	console.log("Server up at http://"+hostname+":"+port);
});

function writeObject(obj) {
	var ret = "{";

	for(var a in obj) {
		ret += '"'+a+'":'+'"'+obj[a]+'"'+',';
	}

	ret = ret.slice(0, ret.length-1);

	return ret+"}";
}