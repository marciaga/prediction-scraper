import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { dbConnection, insertManyDocs, collections } from '../database/connections.js';
import { fiveThirtyEight } from './scrapers/five-thirty-eight';
import { PRODUCTION_PORT, DEV_PORT, ONE_MINUTE } from '../config/constants';

const FETCH_INTERVAL = ONE_MINUTE;
const production = process.env.NODE_ENV === 'production';
const port = production ? PRODUCTION_PORT : DEV_PORT;
const scrapers = [
    fiveThirtyEight()
];

class Application {
    constructor(env, port) {
        this.env = env;
        this.port = port;
        // Async data fetch
        Promise.all(scrapers)
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
        // do the setInterval fetch here
        setInterval(() => {
            Promise.all(scrapers)
            .then((responses) => {
                // connect and write responses to the db
                dbConnection(collections.predictionInfo, 'insert', responses);
            })
            .catch((error) => {
                console.log(error);
            });
        }, FETCH_INTERVAL);
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
