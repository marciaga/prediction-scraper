import Promise from 'bluebird';
import express from 'express';
import http from 'http';
import { dbConnection, insertManyDocs, insertOneDoc, collections } from '../database/connections.js';

import * as scraperModules from './scrapers';

import { PRODUCTION_PORT, DEV_PORT, ONE_MINUTE, ONE_HOUR } from '../config/constants';

const CRAWL_INTERVAL = (11 * ONE_HOUR) + (17 * ONE_MINUTE);
const production = process.env.NODE_ENV === 'production';
const port = production ? PRODUCTION_PORT : DEV_PORT;

const scrapers = Object.keys(scraperModules).map((obj) => scraperModules[obj]);

class Application {
    constructor(env, port) {
        this.env = env;
        this.port = port;
        // Async crawl
        Promise.all(scrapers.map((p) => {
            return p();
        }))
        .then((responses) => {
            // connect and write responses to the db
            dbConnection(collections.predictionInfo, 'insert', responses);
            // start the server
            this.startAppServer();
        })
        .catch((error) => {
            console.log(error);
        });
    }

    startAppServer() {

        let scraperFunctions = scrapers.reduce((memo, f) => {
            memo[f.name] =  f;
            return memo;
        }, {});

        let {
            fiveThirtyEight,
            cnnPolitics,
            nyTimesUpshot,
            predictWise,
            sabatosCrystalBall
        } = scraperFunctions;

        // set the timer for subsequent crawling
        setInterval(() => {

            fiveThirtyEight().then((response) => {
                dbConnection(collections.predictionInfo, 'insert', response);
            }).catch((err) => {
                console.log(err);
            }) ;

            predictWise().then((response) => {
                dbConnection(collections.predictionInfo, 'insert', response);
            }).catch((err) => {
                console.log(err)
            });
            // Electron-based crawlers need some room to breathe
            cnnPolitics();

            setTimeout(() => nyTimesUpshot(), ONE_MINUTE * 4);

            setTimeout(() => sabatosCrystalBall(), ONE_MINUTE * 8);

        }, CRAWL_INTERVAL);

        this.app = express();
        this.createServer();
        this.startServer();
    }

    createServer() {
        this.httpServer = http.createServer(this.app);
    }

    startServer() {
        this.httpServer.listen(this.port, '0.0.0.0', function() {
            console.log(`Application Server: ${process.env.NODE_ENV} - Listening On Port: ${port}`);
        });
    }

}
export default new Application(process.env.NODE_ENV, port);
