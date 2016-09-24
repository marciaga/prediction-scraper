import Promise from 'bluebird';
import express from 'express';
import http from 'http';
import { dbConnection, collections } from '../database/connections.js';

import * as scraperModules from './scrapers';

import { PRODUCTION_PORT, DEV_PORT } from '../config/constants';

const production = process.env.NODE_ENV === 'production';
const port = production ? PRODUCTION_PORT : DEV_PORT;

const scrapers = Object.keys(scraperModules).map((obj) => scraperModules[obj]);

class Application {
    constructor(env, port) {
        this.env = env;
        this.port = port;

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
    }
}
export default new Application(process.env.NODE_ENV, port);
