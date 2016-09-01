import axios from 'axios';
import validateDoc from '../services/validations';
import { parsePercentString} from '../utils/scraperUtils';
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
                doc.url = 'http://predictwise.com/';
                doc.democrat = parsePercentString(democrat);
                doc.republican = parsePercentString(republican);
                doc.date = new Date(Date.now());
                doc.source = 'predict-wise';
                doc.sourceName = 'Predict Wise';
                doc.winning = doc.democrat > doc.republican ? 'democrat' : 'republican';

                // validate the scraper's result
                if (!validateDoc(doc)) {
                    return {};
                }
                return doc;
            })
            .catch((error) => {
                console.log(error);
            });
}
