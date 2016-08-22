import axios from 'axios';
import cheerio from 'cheerio';
// application constants
import { USER_AGENT } from '../config/constants';
// could be application constants in the future
const COOKIE = '';
const REFERER = 'https://google.com/';
const url = 'http://www.nytimes.com/interactive/2016/upshot/presidential-polls-forecast.html';
const MAX_REDIRECTS = 1;

const config = {
    maxRedirects: MAX_REDIRECTS,
    headers: {
        'User-Agent': USER_AGENT,
        'Referer': REFERER,
        'Cookie':COOKIE
    }
};

axios
    .get(url, config)
    .then((response) => {
        let $ = cheerio.load(response.data);
        let percentages = $('.g-cand-top-line-est');
        percentages.each(function(i, e) {
            console.log($(e).text());
        });
    })
    .catch((error) => {
        console.log(error);
    });
