var fs=require("fs");
var downloadDir = '/Users/wenhao/dev/node-spider/downloads/tokyohot/within_500/';
       if( !fs.existsSync(downloadDir) ){
            fs.mkdirSync(downloadDir);
                
              console.log('not exists');


        } else {
        console.log('目录村子啊');
        }
