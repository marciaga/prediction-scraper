import express from 'express';
import http from 'http';
import { dbConnection, insertManyDocs, collections } from '../database/connections.js';
import { fiveThirtyEight } from './scrapers/five-thirty-eight';

const FETCH_INTERVAL = 1800000; // 30 minutes

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
        }, FETCH_INTERVAL)

        this.app = express();
        this.createServer();
        this.startServer();
    }

    createServer() {
        console.log('server created');
        this.httpServer = http.createServer(this.app);
    }

    startServer() {
        console.log('server started');
        // TODO replace these vars with real env vars
        let port = 8008;
        let NODE_ENV = 'development';
        this.httpServer.listen(this.port, '0.0.0.0', function() {
            console.log(`Application Server: ${NODE_ENV} - Listening On Port: ${port}`);
        });
    }

}
// TODO replace hard-coded params
export default new Application('development', 8008);
