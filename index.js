
$("#searchB").on("click", function(){
	var search = $("input").val();

	console.log("Tries to search for "+search);

	$.ajax({
		url: "http://127.0.0.1:4444/search/"+search,
		jsonp: "bsearch",
		dataType: "jsonp"
	})
});

function bsearch(data) {
	var res = $("#search");
	res.empty();
	for(var i in data) {
		res.append("<div>Author: "+data[i].author+"<br> Title: "+data[i].title+"<br> Section: "+data[i].section);
	}
}