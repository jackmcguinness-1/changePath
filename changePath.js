var recursiveSearch = 0;
if(process.argv.length === 4){
    recursiveSearch = 1;
}
var arg1 = process.argv[2];
var isFile;
var isDir;
var excludedFiles = ["changePath.js", "changePath.sh"];
var fs = require("fs").promises;
var srcPath = /media\/paytable/;
var replacementPath = "paytable/";
var imageExtensions = [".jpg", ".png"];
var targetFileExtensions = [".hmtl", ".js", ".txt"];
var targetFiles = [];
var currentFile;
var fileIndex = 0;

function init(arg1){
    if(arg1[0] === "." && arg1[1] === "/"){
        //if the file is in 
        arg1 = arg1.slice(2, arg1.length);
    }
    isFile = (arg1.split(".") != arg1);
    isDir = !isFile;
    if(isFile){
        currentFile = arg1;
        scanFile();
    }
    else{
        handleFolder(arg1);
    }
}

function scanFile(){
    let fileStr = fs.readFile(currentFile, "utf8").then( (resp) => {replaceNextInstance(resp)} );
}

function replaceNextInstance(fileStr){
    positions = [];
    buff = fileStr;
    if(fileStr.match(srcPath) == null){
        console.log("replaced all paths in file: " + currentFile);
        handleNextFile();
        return 0;
    }
    let startPos = fileStr.match(srcPath).index;
    let stringBuff = fileStr.slice(startPos, startPos + 32); // 32 char buffer should be enough for any file name
    let imageType;                                          // hopefully js is managed enough to never overflow
    for(var i = 0; i < imageExtensions.length; i++){
        let extension = imageExtensions[i]
        if(stringBuff.split(extension) != stringBuff){
            imageType = extension;
        }
    }
    let imageStr = stringBuff.split(imageType)[0];
    let imageName = imageStr.split("/")[imageStr.split("/").length - 1];
    console.log("found image: " + imageStr + imageType);
    let replacementStr = "ig.Resource.getPath(" + replacementPath + imageName + imageType + ")";
    console.log("replacing image path with " + replacementStr);
    let outputData = fileStr.replace('"' + imageStr + imageType + '"', replacementStr); //handles the double vs single quotes just in case
    outputData = outputData.replace("'" + imageStr + imageType + "'", replacementStr);
    fs.writeFile(currentFile, outputData);
    scanFile(currentFile);
}

function handleNextFile(){
    if(isFile){
        console.log("all done, exiting");
    }
    else{
        fileIndex ++;
        if(fileIndex < targetFiles.length){
            currentFile = targetFiles[fileIndex];
            console.log("moving on to next file: " + currentFile);
            console.log();
            console.log("--------------------");
            console.log();
            scanFile();
        }
        else{
            console.log("all done, exiting")
        }
    }
}

async function handleFolder(folderName){
    let treeFile = await fs.readFile("treeFile.txt", "utf8");
    let treeList = treeFile.split("\n");
    if(recursiveSearch){
        console.log("performing recursive search and replace on folder : " + arg1);
        for(var i = 0; i < treeList.length; i++){
            let e = treeList[i];
            let ext = e.split(".")[e.split(".").length - 1];
            var isExcluded = false;
            var fileName = e.split("/")[e.split("/").length - 1];
            for(var k = 0; k < excludedFiles.length; k++){
                if(fileName === excludedFiles[i]){
                    isExcluded = true;
                }
            }
            for(var j = 0; j < targetFileExtensions.length; j++){
                var fileName = e.split("/")[e.split("/").length - 1]
                if( ("."+ext) === targetFileExtensions[j] && !isExcluded){
                    targetFiles.push(e);
                    console.log("added file to be handled: " + e);
                }
            }
        }
    }
    else{
        console.log("performing top level search and replace on folder : " + arg1);
        for(var i = 0; i < treeList.length; i++){
            let e = treeList[i];
            let ext = e.split(".")[e.split(".").length - 1];
            var isExcluded = false;
            var fileName = e.split("/")[e.split("/").length - 1];
            for(var k = 0; k < excludedFiles.length; k++){
                if(fileName === excludedFiles[i]){
                    isExcluded = true;
                }
            }
            var fullPath = e.split(fileName)[0];
            for(var j = 0; j < targetFileExtensions.length; j++){
                var isTopLevel = (fullPath == arg1);
                if( ("."+ext) === targetFileExtensions[j] && !isExcluded && isTopLevel){
                    targetFiles.push(e);
                    console.log("added file to be handled: " + e);
                }
            }
        }
    }
    console.log("\n");
    currentFile = targetFiles[0];
    scanFile()
}

init(arg1);