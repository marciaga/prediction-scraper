import MongoClient from 'mongodb';

const mongoParams = {
    host: 'localhost',
    port: '27017',
    db: 'prediction-test'
};

export const collections = {
    predictionInfo: 'predictionInfo'
}
const options = {
    w: 1,
    keepGoing: true,
    forceServerObjectId: true
}
export const dbConnection = function(collection, action, docs) {
    const url = `mongodb://${mongoParams.host}:${mongoParams.port}/${mongoParams.db}`;
    MongoClient.connect(url, (err, db) => {
        if(err) {
            return console.log(err);
        }
        insertManyDocs(db, collection, docs)
    });
}

export const insertManyDocs = function(db, collection, docs) {
    let coll = db.collection(collection);

    coll.insertMany(docs, options, (err, r) => {
        if(err) {
            console.log(err);
        }
        db.close();
    });
}
