import Nightmare from 'nightmare';
import Promise from 'bluebird';
import rimraf from 'rimraf';
import cheerio from 'cheerio';
const fs = require('fs');

import { parsePercentString, candidatePartyFilter } from '../utils/scraperUtils';
import { dbConnection, insertOneDoc, collections } from '../../database/connections.js';
import validateDoc from '../services/validations';
import { USER_AGENT } from '../../config/constants';

let nightmare = Nightmare();

const tempPath = './tmp/index.html';

const config = {
    url: 'http://www.bing.com',
    searchBoxSelector: '#sb_form_q',
    searchTerms: 'new york times who will be president',
    searchSubmitSelector: '#sb_form_go',
    linkSelector: '.b_algo a',
    reasonableInterval: 2000,
    userAgent: USER_AGENT
}

const url = 'http://www.nytimes.com/interactive/2016/upshot/presidential-polls-forecast.html';

// empty out the tmp directory
rimraf(tempPath, function(err) {
    if (err) {
        console.log(err);
    }
});

export const nyTimesUpshot = function() {
    return Promise.resolve(nightmare
        .useragent(config.userAgent)
        .goto(config.url)
        .wait(config.reasonableInterval)
        .type(config.searchBoxSelector, config.searchTerms)
        .click(config.searchSubmitSelector)
        .wait(config.reasonableInterval)
        .click(config.linkSelector)
        .wait(config.reasonableInterval)
        .html(tempPath, 'HTMLOnly')
        .wait(10000)
        .end()
        .then(() => {
            // read the index.html page from the fs
            const file = fs.readFileSync(tempPath, 'utf8');
            // load it into cheerio and parse it
            const $ = cheerio.load(file);

            let doc = {};
            let democrat = candidatePartyFilter($, '.clinton-est');
            let republican = candidatePartyFilter($, '.trump-est');
            doc.url = url;
            doc.democrat = parsePercentString(democrat);
            doc.republican = parsePercentString(republican);
            doc.date = new Date(Date.now());
            doc.source = 'nytimes-upshot';
            doc.sourceName = 'NYTimes Upshot';
            doc.winning = doc.democrat > doc.republican ? 'democrat' : 'republican';
            // validate the scraper's result
            if (!validateDoc(doc)) {
                return {};
            }
            return doc;
        }))
        .catch((err) => {
            console.log(err);
        })
}
