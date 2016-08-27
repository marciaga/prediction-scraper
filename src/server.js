import express from 'express';
import http from 'http';
import { dbConnection, insertManyDocs, collections } from '../database/connections.js';
import { fiveThirtyEight } from './scrapers/five-thirty-eight';
import { nyTimesUpshot } from './scrapers/nytimes-upshot';
import { predictWise } from './scrapers/predictwise';


import { PRODUCTION_PORT, DEV_PORT, ONE_MINUTE, ONE_HOUR } from '../config/constants';

const CRAWL_INTERVAL = (11 * ONE_HOUR) + (17 * ONE_MINUTE);
const production = process.env.NODE_ENV === 'production';
const port = production ? PRODUCTION_PORT : DEV_PORT;
const scrapers = [
    // fiveThirtyEight,
    // nyTimesUpshot,
    predictWise
];

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
        // set the timer for subsequent scraping
        setInterval(() => {
             Promise.all(scrapers.map((p) => {
                 return p();
             }))
            .then((responses) => {
                // connect and write responses to the db
                dbConnection(collections.predictionInfo, 'insert', responses);
            })
            .catch((error) => {
                console.log(error);
            });
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
