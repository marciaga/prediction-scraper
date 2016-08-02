import aws from 'aws-sdk';
/**
 * Callback for publishNotification
 * @param err Error message from AWS
 * @param data Success message from AWS
*/
const notificationCallback = (err, data) => {
    if (err) {
        // ideally, logging these would be helpful so we know if the notifications aren't being sent properly
        console.log(err);
    }
};
// Creates new SNS object
const sns = new aws.SNS({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});
/**
 * Publishes a notification to AWS SNS
 * @param {Object} Parms with keys date and scraperName
 * @returns {Function} Returns a callback
*/
const publishNotification = (p) => {
    let message = `${p.scraperName} scraper failed validation on ${p.date}.`;

    const publishParams = {
        TopicArn: process.env.TOPIC_ARN,
        Message: message
    };
    sns.publish(publishParams, notificationCallback);
}

export default publishNotification;
