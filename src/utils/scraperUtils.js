/**
 * Parses a percent expressed as a string.
 * @param {String} A string value of a percentage
 * @returns {Number} Returns the value as an integer or NaN if string passed in was empty
*/
export const parsePercentString = (s) => {
    let str = s.replace(/%/, '');
    // if str contains a decimal point, parse it as a float, otherwise parse it as an int
    return str.includes('.') ? parseFloat(str) : parseInt(str);
};
/**
 * Finds and filters by selectors and party
 * @param {Cheerio Object} $
 * @param {Object} c class attribute
 * @returns {String} A string value which represents a percentage, if found otherwise an empty string
*/
export const candidatePartyFilter = ($, c) => {
    return $(c).text();
};
