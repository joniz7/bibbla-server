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
		if(req.url.includes("/search/")) {
			var end = req.url.lastIndexOf("?");
			var searchStr = req.url.substring(req.url.lastIndexOf("/")+1, (end < 0 ? req.url.length : end));

			console.log("Got search request for "+searchStr);

			request('http://www.gotlib.goteborg.se/search*swe/X?searchtype=X&searcharg='+searchStr, function(error, response, body){
				if(!error && response.statusCode == 200) {
					res.writeHead(200, {"Content-Type":"application/javascript"});

					$ = cheerio.load(body);
					
					var potBooks = $('.sokresultat');	
					var result = "bsearch([";
					
					potBooks.each(function(index, elem){
						var book = (result.length > 9 ? ",{" : "{");
						var strong = $(elem).find('strong');
						var author = strong.first().html()
						
						// make sure we only get the one we are interested in
						if($(elem).find('font').length != 1) {
							return true;
						}

						var firstAttr = true;

						if(strong.last() != null) {
							var section = strong.last().html();
						}
						
						var title = $(elem).find('a').html();

						if(author) {
							book += writeProperty("author", author.replace("\n", ""));
							firstAttr = false;
						}
						
						if(section) {
							book += (!firstAttr ? "," : "") + writeProperty("section", section.replace("\n", ""));
							firstAttr = false;
						}

						if(title) {
							book += (!firstAttr ? "," : "") + writeProperty("title", title.replace("\n", ""));
							firstAttr = false;	
						}

						book += "}";

						if(book.length > 3)
							result += book;
					});

					res.end(result + "]);");
				} else {
					res.writeHead(404, {"Content-Type":"text/html"});
					res.end("<html><body>We ain't found shit</body></html>");
				}
			});
		} else if (req.url == "/") {
			res.writeHead(200, {"Content-Type":"text/html"});
			res.end(html);
		} else {
			var searchStr = req.url.substring(req.url.lastIndexOf("/")+1, req.url.length);

			request('http://www.gotlib.goteborg.se/search*swe/X?searchtype=X&searcharg='+searchStr, function(error, response, body){
				$ = cheerio.load(body);
				res.end($.html());
			});
		}
	}
	
}).listen(port, hostname, function() {
	console.log("Server up at http://"+hostname+":"+port);
});

function writeProperty(prop, value) {
	return prop+":"+(typeof(value) == 'string' ? '"' : '')+value+(typeof(value) == 'string' ? '"' : '');
}

function writeObject(obj) {
	var ret = "{";

	for(var a in obj) {
		ret += writeProperty(a, obj[a]);
	}

	ret = ret.slice(0, ret.length-1);

	return ret+"}";
}