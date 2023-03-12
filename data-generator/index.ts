import { MongoClient } from 'mongodb';

// Function to generate a random number between two values
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Function to generate a random date between two dates
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  const mongoHost = process.env.MONGO_HOST;
  const mongoPort = process.env.MONGO_PORT || 27017;
  const mongoDatabase = process.env.MONGO_DATABASE || 'timeseries-db';
  const mongoCollection = process.env.MONGO_COLLECTION || 'temperatures';

  const url = `mongodb://${mongoHost}:${mongoPort}/${mongoDatabase}`;

  const client = new MongoClient(url);

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to MongoDB');

    // Get a reference to the time series collection
    const db = client.db(mongoDatabase);
    const collectionName = mongoCollection;
    const existingCollection = await db.listCollections({ name: collectionName }).next();
    const collectionOptions = {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'seconds'
      }
    };
    let collection;
    if (!existingCollection) {
      console.log('Creating time series collection');
      collection = await db.createCollection(collectionName, collectionOptions);
    } else {
      console.log('Using existing time series collection');
      collection = db.collection(collectionName);
    }

    // Insert random temperature data
    const start = new Date('2023-01-01T00:00:00.000Z');
    const end = new Date('2023-12-31T23:59:59.999Z');
    const maxDataPoints = 5000;
    const dates = Array.from({ length: maxDataPoints }, () => randomDate(start, end));
    const temperatures = Array.from({ length: maxDataPoints }, () => randomBetween(-5, 32));
    const documents = dates.map((date, index) => ({
      timestamp: date,
      temperature: temperatures[index]
    }));
    console.log(`Inserting ${documents.length} documents`);
    await collection.insertMany(documents);

    console.log('Done');
  } catch (err) {
    console.error(err);
  } finally {
    // Close the connection to the database
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main();
