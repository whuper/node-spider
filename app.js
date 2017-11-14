var cheerio = require('cheerio');
var superagent = require('superagent');

// extend with Request#proxy()
require('superagent-proxy')(superagent);

// HTTP, HTTPS, or SOCKS proxy to use
// http://61.135.169.121:443  'http://127.0.0.1:1080'
var proxy = process.env.http_proxy || 'http://127.0.0.1:1080';


var index_url = 'http://www.tokyo-hot.com/product/?page=';
var cur_page = 1;

superagent
	.get(index_url + cur_page)
	.proxy(proxy)
	.end(onresponse);



function onresponse (err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res.status, res.headers);
    console.log(res.body);
			console.log(res);
			return;
		var $ = cheerio.load(res.text);
		var items = [];
		$('ul.list li.detail').each(function(idx, element) {
			var $element = $(element);
			var a_element = $element.find('a.rm');
			var desc_element = a_element.find('.description2');
			items.push({
				href: a_element.attr('href'),
				cover: a_element.find('>img').attr('src'),
				title: desc_elementfind('.title').text(),
				actor: desc_element.find('.actor').text(),
				text: desc_element.find('.text').text()
			});
	});

	//保存到数据库里
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('./nodespider.db');

	db.serialize(function() {
		//db.run("CREATE TABLE lorem (info TEXT)");
		var stmt = db.prepare("INSERT INTO tokyohot(id,title,designation,videoName,actor,videoName,url) VALUES (?,?,?,?,?,?,?,?,?)");
		items.forEach(function(item) {
			console.log(item);
			stmt.run(null, item.title, null, null, item.actor, null, item.href,item.text,item.over);
		})
		stmt.finalize();
		/*db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
			  console.log(row.id + ": " + row.info);
		  });*/
	});

	db.close();
  }
}

