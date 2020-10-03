// read plugin
const path = require('path');
const fs = require('fs');
var cp = require('child_process');
//joining path of directory 
const directoryPath = "./services"
//passsing directoryPath and callback function
const start = fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(path.join(directoryPath, file) + " starting");
        var worker = cp.fork(path.join("./", directoryPath, file));
        worker.on('exit', (code, signal)=>{
            console.log('child process exited with code ' + code);
        });
    });
});

module.exports = start;