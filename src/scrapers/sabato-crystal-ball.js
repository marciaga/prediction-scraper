import Nightmare from 'nightmare';
import Promise from 'bluebird';

import validateDoc from '../services/validations';
import { USER_AGENT } from '../../config/constants';
const url = 'http://www.270towin.com/maps/crystal-ball-electoral-college-ratings';

let nightmare = new Nightmare();

const percentOfElectoral = (n) => {
    let num = parseInt(n);
    if (Number.isNaN(num)) {
        return 0;
    }

    return Math.round((num/538) * 100);
};

export const sabatosCrystalBall = function() {
    return Promise.resolve(
        nightmare
        .useragent(USER_AGENT)
        .goto(url)
        .wait(10000)
        .evaluate(function() {
            var demRaw = document.querySelector('#dem_ev').innerHTML;
            var repRaw = document.querySelector('#rep_ev').innerHTML;

            return {
                demRaw: demRaw,
                repRaw: repRaw
            }
        })
        .end()
        .then(function(result) {
            // result: { demRaw: '348', repRaw: '190' }
            const demPercent = percentOfElectoral(result.demRaw);
            const repPercent = percentOfElectoral(result.repRaw);

            let doc = {};

            doc.url = url;
            doc.date = new Date(Date.now());
            doc.source = 'sabato-crystal-ball';
            doc.sourceName = `Sabato's Crystal Ball`;
            doc.democrat = demPercent;
            doc.republican = repPercent;
            doc.winning = doc.democrat > doc.republican ? 'democrat' : 'republican';
            // validate the scraper's result
            if (!validateDoc(doc)) {
                return {};
            }

            return doc;
        })
        .catch(function(err) {
            console.log('err', err);
        })
    );
}
