import MongoClient from 'mongodb';
const mongoParams = {
    host: 'localhost',
    port: '27017',
    db: 'poll-test'
};

export const dbConnection = function() {
    const url = `mongodb://${mongoParams.host}:${mongoParams.port}/${mongoParams.db}`;

    MongoClient.connect(url, (err, db) => {
        console.log('connected to server');
        db.close();
    });
}

/**
 * Data Document Structure
  {
      int republicanPercent
      int democratPercent
      dateTime date
  }
*/
