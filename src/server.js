import express from 'express';
import http from 'http';
import { dbConnection } from '../database/connections.js';
import { fiveThirtyEight } from './scrapers/five-thirty-eight';

const FETCH_INTERVAL = 1800000; // 30 minutes

class Application {
    constructor(env, port) {
        this.env = env;
        this.port = port;
        // Async data fetch
        // dbConnection()

        Promise.all([fiveThirtyEight()])
            .then((responses) => {
                // do stuff with responses
                console.log(responses);
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
            /*
            // asynchronously fetch data
            myFunc().then((response) => {
                // do stuff with data
            });
            */

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
