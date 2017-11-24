
var writejson = require('./writejson');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./nodespider.db');
var modify;


var sqlStr = `SELECT id,videoUrl,actor FROM tokyohot where id > 1726`;
	db.each(sqlStr,function(err, row){
		 if (err){
		 console.log(err);
		 writejson(err);
		 }
		if(row['videoUrl']){
			var videoName = row['videoUrl'].substr(row['videoUrl'].lastIndexOf("/")+1);
		} else {
			var videoName = null;
		}
		if(row['actor']){
			var designation = row['actor'].replace(/[\s+\(\):]/g,"");
		} else {
			var designation = null;
		}
		
		
		console.log(videoName + designation + ' ' + row['id']);

		// 更新到数据库里
		modify = db.prepare("UPDATE tokyohot SET designation = ?,videoName = ? WHERE id = ?");
		modify.run(designation,videoName,row.id);
		modify.finalize();		
	});
	
    db.close();



