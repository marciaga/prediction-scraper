import axios from 'axios';
import cheerio from 'cheerio';
import publishNotification from '../services/aws-notifications';

const url = 'http://projects.fivethirtyeight.com/2016-election-forecast/';

/**
 * Finds and filters by selectors and party
 * @param {Object} o with keys mainSelector, childSelector, dataAttr
 * @param {String} party
 * @returns {String} A string value which represents a percentage
*/
function candidatePartyFilter(o, p, $) {
    let $data = $(o.mainSelector).find(o.childSelector).filter((k, v) => $(v).data(o.dataAttr) === p);
    return $data.first().text();
}
/**
 * Parses a percent expressed as a string.
 * @param {String} A string value of a percentage
 * @returns {Number} Returns the value as an integer
*/
function parsePercentString(s) {
    let str = s.replace(/%/, '');
    // if str contains a decimal point, parse it as a float, otherwise parse it as an int
    return str.includes('.') ? parseFloat(str) : parseInt(str);
}

const params = {
    mainSelector: '.card-winprob-us',
    childSelector: '.candidate-val',
    dataAttr: 'party'
};

export const fiveThirtyEight = function() {
    return axios
            .get(url)
            .then((response) => {
                const $ = cheerio.load(response.data);
                let doc = {};
                let democrat = candidatePartyFilter(params, 'D', $);
                let republican = candidatePartyFilter(params, 'R', $);

                doc.url = url;
                doc.democrat = parsePercentString(democrat);
                doc.republican = parsePercentString(republican);
                doc.date = new Date(Date.now());
                doc.source = 'five-thirty-eight';
                doc.sourceName = 'Five Thirty Eight';
                doc.winning = doc.democrat > doc.republican ? 'democrat' : 'republican';
                // TODO Call validation here to ensure the scraper's health
                publishNotification({ date: doc.date, scraperName: doc.sourceName});
                return doc;
            })
            .catch((error) => {
                console.log(error);
            });
}
