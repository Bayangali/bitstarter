#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://evening-everglades-8693.herokuapp.com/";


var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.",instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrlContent = function(htmlcontent){
	return cheerio.load(htmlcontent);
}

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile,checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var checkUrlContent = function(url,checksfile){
	var checks = loadChecks(checksfile).sort();
    var out = {};    
	rest.get(url).on('complete',function(result,response){
		if(result instanceof Error){
			console.error('Error: ' + response.messag);
		} else {
			$ = cheerioUrlContent(result);
			for(var ii in checks){
				var present = $(checks[ii]).length > 0;
				out[checks[ii]] = present;
			}
			var outJson = JSON.stringify(out,null,4);
			console.log(outJson);
		}
	});
}

var clone = function(fn){
    return fn.bind({});
};

if(require.main == module){
    program
	.option('-c, --checks <check_file>','Path to checks.json',clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file)', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_path>', 'URL path of html page')
        .parse(process.argv);
	
	var checkJson;
	
	if(program.url == undefined){
		checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson,null,4);
		console.log(outJson);
	} else {
		checkJson = checkUrlContent(program.url, program.checks);
	}
    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
