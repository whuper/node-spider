var cheerio = require('cheerio');
var superagent = require('superagent');

superagent.get('http://localhost/blog.html').end(function(err, sres) {
	if (err) {
		return next(err);
	}
	var $ = cheerio.load(sres.text);
	var items = [];
	$('#post_list .post_item').each(function(idx, element) {
		var $element = $(element);
		items.push({
			title: $element.find('a.titlelnk').text(),
			author: $element.find('a.lightblue').text(),
			href: $element.find('a.titlelnk').attr('href')
		});
	});

	//保存到数据库里
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('./nodespider.db');

	db.serialize(function() {
		//db.run("CREATE TABLE lorem (info TEXT)");
		var stmt = db.prepare("INSERT INTO tokyohot(id,title,designation,videoName,actor,videoName,url) VALUES (?,?,?,?,?,?,?)");
		items.forEach(function(item) {
			console.log(item);
			stmt.run(null, item.title, null, null, item.author, null, item.href);
		})
		stmt.finalize();
		/*db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
			  console.log(row.id + ": " + row.info);
		  });*/
	});

	db.close();

});

