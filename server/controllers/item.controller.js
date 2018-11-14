const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const crawler = require('../middleware/search.js');

const searchSchema = Joi.object({
  searchKey: Joi.string().required(),
  maxPagesToVisit: Joi.number().integer().positive()
});

var SEARCH_WORD = '';
var START_URL = '';
var MAX_PAGES_TO_VISIT = -1;
var pagesToVisit = [];
var otherPagesToVisit = [];

module.exports = {
  insert,
  search
}

async function insert(user) {
  user = await Joi.validate(user, userSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;
  return await new User(user).save();
}


async function search(item) {
  item = await Joi.validate(item, searchSchema, { abortEarly: false });

  var request = require('request');
  var cheerio = require('cheerio');
  var URL = require('url-parse');

  var START_URL = "http://anime2enjoy.com/anime-list";

  var SEARCH_WORD = item.searchKey;

  pagesToVisit.push(START_URL);

  crawl();
}

function crawl() {
  /*if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log(`Reached max limit of number of pages to visit.`);
    log.info("Reached max limit of number of pages to visit.");
    return;
  }*/

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
    crawler.visitPage(nextPage, SEARCH_WORD, crawl);
  }
}