import publishNotification from './aws-notifications';
/**
 * Validates the document
 * @param {Object} doc
 * side effect: a notification is published if validation fails
 * @returns {Boolean} True or False, depending on whether the scraper's results are valid
*/
const validateDoc = (doc) => {
    if (Number.isNaN(doc.democrat) || Number.isNaN(doc.republican)) {
        // Send out a notification email to dev team to let them know a scraper failed
        publishNotification({ date: doc.date, scraperName: doc.sourceName });
        return false;
    }
    return true;
};

export default validateDoc
