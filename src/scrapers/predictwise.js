import axios from 'axios';
import validateDoc from '../services/validations';
import { USER_AGENT } from '../../config/constants';

const url = 'http://table-cache1.predictwise.com/latest/table_1032.json';

/**
 * Finds and filters by selectors and party
 * @param {String} selector and JSON data returned from axios call
 * @returns {String} A string value which represents a percentage, if found otherwise an empty string
*/
function candidatePartyFilter(p, data) {
    let res = data.find((x) => {
        if (x[0] === p) {
            return x;
        }
    });
    return res[1];
}
/**
 * Parses a percent expressed as a string.
 * @param {String} A string value of a percentage
 * @returns {Number} Returns the value as an integer or NaN if string passed in was empty
*/
function parsePercentString(s) {
    let str = s.replace(/\s%/, '');
    console.log("str", str);
    // if str contains a decimal point, parse it as a float, otherwise parse it as an int
    return str.includes('.') ? parseFloat(str) : parseInt(str);
}

export const predictWise = function() {
    return axios
            .get(url, {
                headers: { 'User-Agent': USER_AGENT }
            })
            .then((response) => {
                const data = response.data.table;

                let doc = {};
                let democrat = candidatePartyFilter('Democratic', data);
                let republican = candidatePartyFilter('Republican', data);
                console.log("democrat", democrat);
                console.log("republican", republican);
                doc.url = url;
                doc.democrat = parsePercentString(democrat);
                doc.republican = parsePercentString(republican);
                doc.date = new Date(Date.now());
                doc.source = 'predict-wise';
                doc.sourceName = 'Predict Wise';
                doc.winning = doc.democrat > doc.republican ? 'democrat' : 'republican';
                console.log("doc", doc);
                // validate the scraper's result
                // if (!validateDoc(doc)) {
                //     return {};
                // }
                // return doc;
            })
            .catch((error) => {
                console.log(error);
            });
}
