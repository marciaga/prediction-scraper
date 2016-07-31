import aws from 'aws-sdk';

const notificationCallback = (err, data) => {
    if (err) {
        console.log(err);
    }
    console.log('published message');
    // data is null if there's an error
    console.log(data);
};
const sns = new aws.SNS({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const publishNotification = (p) => {
    let message = `${p.scraperName} scraper failed validation on ${p.date}.`;
    console.log(message);
    const publishParams = {
        TopicArn: process.env.TOPIC_ARN,
        Message: message
    };
    sns.publish(publishParams, notificationCallback);
}

export default publishNotification;
