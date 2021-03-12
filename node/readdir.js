var testFolder = './data'; // 이 파일 있는 위치 기준 아니라 내가 실행하는 위치 기준 
var fs = require('fs');
 
fs.readdir(testFolder, function(error, filelist){
  console.log(filelist);
})