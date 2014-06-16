var d = new Date();
var n = d.toISOString();

console.log(n);

var temp = new Date("2014-06-12T19:55:33.293Z");

console.log("temp: " + temp);

if (d > temp)
	console.log("senere");

var temp2 = new Date("2014-06-12T19:00:00.000Z");

if (temp2 > temp)
	console.log("senere");
