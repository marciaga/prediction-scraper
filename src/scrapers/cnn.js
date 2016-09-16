import Nightmare from 'nightmare';
import Promise from 'bluebird';

import validateDoc from '../services/validations';
import { dbConnection, insertOneDoc, collections } from '../../database/connections.js';
import publishNotification from '../services/aws-notifications';
import { USER_AGENT } from '../../config/constants';
import { parsePercentString } from '../utils/scraperUtils';
const url = 'http://www.cnn.com/specials/politics/predict';

let nightmare = new Nightmare();

export const cnnPolitics = function() {
    return Promise.resolve(
        nightmare
        .useragent(USER_AGENT)
        .goto(url)
        .wait(15000)
        .evaluate(function() {
            let widgets = document.querySelectorAll('div.pivit-gameplay-widget');
            const demName = widgets[0].querySelector('p.pivit-widget-gameplay-contract-name').innerHTML;
            const demPercent = widgets[0].querySelector('div.pivit-widget-gameplay-price').innerHTML;
            const repName = widgets[1].querySelector('p.pivit-widget-gameplay-contract-name').innerHTML;
            const repPercent = widgets[1].querySelector('div.pivit-widget-gameplay-price').innerHTML;

            return {
                demName: demName,
                demPercent: demPercent,
                repName: repName,
                repPercent: repPercent
            };
        })
        .end()
        .then((result) => {
            /**
             * Result object:
            {
                demName: 'Democrats',
                demPercent: '82%',
                repName: 'Republicans',
                repPercent: '18%'
            }
            */
            const republican = {
                name: result.repName,
                percent: result.repPercent
            };
            const democrat = {
                name: result.demName,
                percent: result.demPercent
            };

            let doc = {};

            doc.url = url;
            doc.date = new Date(Date.now());
            doc.source = 'cnn-politics';
            doc.sourceName = 'CNN Political Prediction Market';

            if (democrat.name !== 'Democrats' || republican.name !== 'Republicans') {
                publishNotification({ date: doc.date, scraperName: doc.sourceName });
                return {};
            }
            doc.democrat = parsePercentString(democrat.percent);
            doc.republican = parsePercentString(republican.percent);
            doc.winning = doc.democrat > doc.republican ? 'democrat' : 'republican';
            // validate the scraper's result
            if (!validateDoc(doc)) {
                return {};
            }

            return doc;
        })
        .then((doc) => {
            dbConnection(collections.predictionInfo, 'insert', doc);
        })
        .catch(function(err) {
            console.log('err', err);
        })
    );
};
