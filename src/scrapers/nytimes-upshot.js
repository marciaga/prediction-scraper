import Nightmare from 'nightmare';
import Promise from 'bluebird';
import rimraf from 'rimraf';
import cheerio from 'cheerio';
const fs = require('fs');

import validateDoc from '../services/validations';
import { USER_AGENT } from '../../config/constants';

let nightmare = new Nightmare({show:true});

const tempPath = './tmp/*'
const config = {
    url: 'http://www.bing.com',
    searchBoxSelector: '#sb_form_q',
    searchTerms: 'new york times prediction forecast election 2016',
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


/**
 * Finds and filters by selectors and party
 * @param {Object} c class attribute
 * @returns {String} A string value which represents a percentage, if found otherwise an empty string
*/
function candidatePartyFilter($, c) {
    return $(c).text();
}
/**
 * Parses a percent expressed as a string.
 * @param {String} A string value of a percentage
 * @returns {Number} Returns the value as an integer or NaN if string passed in was empty
*/
function parsePercentString(s) {
    let str = s.replace(/%/, '');
    // if str contains a decimal point, parse it as a float, otherwise parse it as an int
    return str.includes('.') ? parseFloat(str) : parseInt(str);
}

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
        .html('./tmp/index.html', 'HTMLOnly')
        .wait(10000)
        .end()
        .then(() => {
            // read the index.html page from the fs
            const file = fs.readFileSync('./tmp/index.html', 'utf8')
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
            console.log("doc", doc);
            return doc;
        }))
        .catch((err) => {
            console.log(err);
        });
}
