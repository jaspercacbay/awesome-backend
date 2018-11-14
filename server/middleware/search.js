// const opts = {
//   logDirectory:'./mylogfiles', // NOTE: folder must exist and be writable...
//   fileNamePattern:'roll-<DATE>.log',
//   dateFormat:'YYYY.MM.DD'
// };
// const log = require('simple-node-logger').createRollingFileLogger( opts );

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var config = require('../config/config');

var START_URL = config.startUrl;
// var START_URL = "http://www.mediafire.com/file/micxh2vmod912kj/%5BAnimE2Enjoy.Com%5D+KC+-+%2801%29+%5BHS-S2O%5D.a2e";
// var START_URL = "http://linkshrink.net/7Ywupn";
// var START_URL = "http://anime2enjoy.com";
// var SEARCH_WORD = "revc";
var MAX_PAGES_TO_VISIT = 50;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var otherPagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

// const {NodeVM} = require('vm2');
// const vm = new NodeVM();


// pagesToVisit.push({ url: START_URL, extract: false });
pagesToVisit.push(START_URL);
crawl();



// start url
function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log(`Reached max limit of number of pages to visit.`);
    // log.info("Reached max limit of number of pages to visit.");
    return;
  }

  // handle case where no more primary links
  if (pagesToVisit.length == 0) {
    console.log(`no more related links, getting from other links`);
    // use list of secondary pages to crawl
    // pagesToVisit = pagesToVisit.concat(otherPagesToVisit);
    // console.log(pagesToVisit);
    // or better pop one from secondary each time
    if (otherPagesToVisit.length == 0) return;
    pagesToVisit.push(otherPagesToVisit.shift());
  }

  var nextPage = pagesToVisit.shift();
  if (nextPage in pagesVisited) {
    // Finished visiting this page, so get next page to crawl
    console.log(`Already searched this page, checking the next page in list`);
    crawl();
  }
  else {
    // Visit new page
    visitPage(nextPage, crawl);
  }
}



function visitPage(url, searchKey, callback) {
  var SEARCH_WORD = searchKey;
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log(`Visiting page #${numPagesVisited}: ${url}`);
  // log.info(`Visiting page ${url}`);
  request(url, function(error, response, body) {
    if (error) {
      // log.warn(`Response error! ${error}`);
      callback();
      return;
    }
    // Check status code (200 is HTTP OK)
    if (response.statusCode !== 200) {
      console.log("Status code: " + response.statusCode);
      callback();
      return;
    }
    // Parse the document body
    var $ = cheerio.load(body);
    // search page for keyword
    var isWordFound = searchForWord($, SEARCH_WORD);
    // if found keyword
    checkHost = new URL(url);

    console.log(checkHost.hostname);

    if (checkHost.hostname == 'www.mediafire.com') {
      console.log("mediafire");
      handleMediafire($);
    }
    else if (isWordFound) {
      // check if keyword can be related to a link (**TODO**)
      // if there is link
      // set as result link and get rule to extract data from this link
      // if no link
      // apply rule to page and extract data
      // repeat search page
      console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
      collectPriorityLinks($);
      // handleLinkShrink($);
      // callback();
    } 
    else {
      // else if not found
      // search for relative links then store as secondary links
      collectBackupLinks($);
      // In this short program, our callback is just calling the function crawl
      callback();
    }
  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').html().toLowerCase();

  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

// store links which has the search word
function collectPriorityLinks($) {
  // get rule from db for link heirarchy
  var testing = $("div").filter(function(i, el) {
    return $(el).text().toLowerCase().indexOf(SEARCH_WORD) !== -1;
  });
  console.log(`!!!! ${testing.length} items`);
  testing.each(function() {
    console.log($(this).html());
  });

  var relativeLinks = $("div.entry-content a[href]").filter(function(i, el) {
    return hasSearchWord($(el).text(), SEARCH_WORD);
  });

  console.log("Found " + relativeLinks.length + " relative links on page");
  relativeLinks.each(function() {
    link = $(this).attr('href');
    
    if (isUsefulLink(link)) {
      if (!link.startsWith('/'))
        link = '/' + link;
      // log.info(`Adding ${link} to pagesToVisit`);
      pagesToVisit.push(baseUrl + link);
    }
  });
}

// store relative links which doesnt have the keyword but may be related
function collectBackupLinks($) {
  // console.trace("something called collectBackupLinks()");

  /*var relativeLinks = $("a[href]").filter(function(i, el) {
    // get filter rule from db for to use links
    return isUsefulLink($(el).text());
  });*/

  var relativeLinks = $("a[href]");

  console.log("Found " + relativeLinks.length + " relative links on page");
  relativeLinks.each(function() {
    link = $(this).attr('href');
    
    if (isUsefulLink(link)) {
      if (!link.startsWith('/'))
        link = '/' + link;
      // log.info(`Adding ${link} to otherPagesToVisit`);
      otherPagesToVisit.push(baseUrl + link);
    }
  });
}

function hasSearchWord(text, searchWord) {
  return text.toLowerCase().indexOf(searchWord) !== -1;
}

function isUsefulLink(item) {
  return (
    item.indexOf('http') === -1 && 
    item.indexOf('author') === -1 && 
    item.slice(-1) == '/' && 
    item.length > 1
  );
}


function handleLinkShrink($) {
  testing = $("script").filter(function(i, el) {
    return $(el).html().toLowerCase().indexOf(SEARCH_WORD) !== -1;
  });

  // console.log(testing.length);
  var generalFunc = [];
  // console.log(testing[0])
  testing.each(function(i, elem) {
    console.log($(this).html());

    generalFunc.push($(this).html());
  });

  console.log(`running ${generalFunc[0]}`);
  var newFunc = vm.run(`module.exports = ${generalFunc[0]}`);

  text = generalFunc[1];
  a = text.substring(text.indexOf('revC("')+6);
  b = a.substring(0, a.indexOf('"'));
  console.log(`running ${b}`);

  console.log(newFunc(b));
}


function handleMediafire($) {
  var test = [];

  testing = $("div[class=download_link] > a[href]");
  testing.each(function() {
    link = $(this).attr('href');
    
    test.push(link);
    console.log(link);
  });

  console.log(test.length);
  console.log(test[0]);
}

module.exports = {
  visitPage
}