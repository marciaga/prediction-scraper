import axios from 'axios';
import cheerio from 'cheerio';
import validateDoc from '../services/validations';
import { USER_AGENT } from '../../config/constants';

const url = 'http://www.nytimes.com/interactive/2016/upshot/presidential-polls-forecast.html';

let cookie = 'RMID=007f010153c7578424960003; _cb_ls=1; __gads=ID=dda90461dd6a1c40:T=1468961298:S=ALNI_Mbr_9M51gi2hCtOtYlFKUkVxiinZQ; HTML_ViewerId=038bd2d6-cafd-6443-b885-bf20f5e4bf92; optimizelyEndUserId=oeu1468961315565r0.8942422696175232; mnet_session_depth=1%7C1471833577614; OX_plg=swf|shk|pm; __utma=69104142.1861609174.1469301608.1469463936.1471833581.3; __utmc=69104142; __utmz=69104142.1471833581.3.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); NYT-mab=%7B%222%22%3A%22A4%22%7D; _dyid=-7079658410895031675; _dyfs=true; nyt-m=A303EA6392EEF783B5F2480C31E3EC20&e=i.1472688000&t=i.10&v=i.3&l=l.15.1215381798.2110577255.3738510683.-1.-1.-1.-1.-1.-1.-1.-1.-1.-1.-1.-1&n=i.2&g=i.0&rc=i.0&er=i.1470869926&vr=l.4.2.6.0.0&pr=l.4.7.11.0.0&vp=i.6&gf=l.10.1215381798.2110577255.3738510683.-1.-1.-1.-1.-1.-1.-1&ft=i.0&fv=i.0&gl=l.2.-1.-1&rl=l.1.-1&cav=i.3&imu=i.1&igu=i.1&prt=i.5&kid=i.1&ica=i.1&iue=i.0&ier=i.0&iub=i.0&ifv=i.0&igd=i.0&iga=i.0&imv=i.0&igf=i.1&iru=i.0&ird=i.0&ira=i.0&iir=i.0&gb=l.3.2.3.1471910400&abn=s.close_door_90_10_jun2016&abv=i.1; adxcl=l*45555=6013964f:1; adxcs=s*4534c=0:1; NYT-S=0M8PwjWuh4dEPDXrmvxADeHw6h3y7jcy2TdeFz9JchiAI6GpR90PNu0YV.Ynx4rkFI; optimizelySegments=%7B%223007620980%22%3A%22search%22%2C%223013750536%22%3A%22false%22%2C%223028090192%22%3A%22gc%22%2C%223032570147%22%3A%22none%22%2C%223315571554%22%3A%22search%22%2C%223321851195%22%3A%22false%22%2C%223334171090%22%3A%22none%22%2C%223336921036%22%3A%22gc%22%7D; _cb=BB0_6lqX0xVO3PqK; _chartbeat2=.1468277915882.1471842305135.0000000000000001; walley=GA1.2.966070056.1468277915; _gat_r2d2=1; optimizelyBuckets=%7B%225355901213%22%3A%225361970061%22%7D; _dycst=dk.m.c.ms.frv3.tos.; _dy_geo=US.NA.US_OR.US_OR_Portland; _dy_df_geo=United%20States.Oregon.Portland; _dy_toffset=-4; nyt-a=77f840ad0b0233df186f86d90cf35872; _sp_id.75b0=b0c69b414fe04f6d.1468277915.7.1471842336.1471834022; _sp_ses.75b0=*; _chartbeat4=t=DgjP7OD8iP7h0yIJgBac7vTBLNrNt&E=0&EE=0&x=499&c=1.11&y=8024&w=200; _dyus_8765260=80%7C0%7C0%7C0%7C0%7C0.0.1468277915461.1471842307643.3564392.0%7C233%7C35%7C7%7C116%7C7%7C0%7C0%7C0%7C0%7C0%7C0%7C7%7C0%7C0%7C0%7C2%7C4%7C7%7C7%7C0%7C0%7C0%7C0';

let cook = '__utmz=69104142.1471833581.3.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)';

/**
 * Finds and filters by selectors and party
 * @param {Object} c class attribute
 * @returns {String} A string value which represents a percentage, if found otherwise an empty string
*/
function candidatePartyFilter($, c) {
    return $(c).text();
}
/**
 * Parses a percent expressed as a string.
 * @param {String} A string value of a percentage
 * @returns {Number} Returns the value as an integer or NaN if string passed in was empty
*/
function parsePercentString(s) {
    let str = s.replace(/%/, '');
    // if str contains a decimal point, parse it as a float, otherwise parse it as an int
    return str.includes('.') ? parseFloat(str) : parseInt(str);
}

export const nyTimesUpshot = function() {
    return axios
            .get(url, {
                headers: {
                    'User-Agent': USER_AGENT
                    'Referer': 'https://www.google.com/',
                    'Cookie': cookie
                },
                maxRedirects: 100
            })
            .then((response) => {
                console.log(response.data);
                const $ = cheerio.load(response.data);
                let doc = {};
                let democrat = candidatePartyFilter($, '.clinton-est');
                let republican = candidatePartyFilter($, '.trump-est');

                // doc.url = url;
                // doc.democrat = parsePercentString(democrat);
                // doc.republican = parsePercentString(republican);
                // doc.date = new Date(Date.now());
                // doc.source = 'nytimes-upshot';
                // doc.sourceName = 'NYTimes Upshot';
                // doc.winning = doc.democrat > doc.republican ? 'democrat' : 'republican';
                // // validate the scraper's result
                // if (!validateDoc(doc)) {
                //     return {};
                // }
                // return doc;
            })
            .catch((error) => {
                console.log(error);
            });
}
