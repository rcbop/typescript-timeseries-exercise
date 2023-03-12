import { DateTime } from 'luxon';
import { MongoClient } from 'mongodb';
import * as yargs from 'yargs';


async function main() {
  // Define command-line arguments
  const argv = await yargs
    .usage('Usage: --start <startDate> --end <endDate> [options]')
    .option('start', {
      describe: 'Start date in YYYY-MM-DD format',
      type: 'string',
    })
    .option('end', {
      describe: 'End date in YYYY-MM-DD format',
      type: 'string',
    })
    .option('max', {
      alias: 'm',
      describe: 'Maximum number of data points to display',
      type: 'number',
    })
    .strict()
    .help()
    .argv;

  if (!argv.start || !argv.end) {
    console.error('Missing start or end date.');
    process.exit(1);
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  // check if the date is in the correct format
  if (!dateRegex.test(argv.start) || !dateRegex.test(argv.end)) {
    console.error('Invalid date format. Use YYYY-MM-DD format.');
    process.exit(1);
  }

  try {
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    const mongoPort = process.env.MONGO_PORT || 27017;
    const mongoDatabase = process.env.MONGO_DATABASE || 'timeseries-db';
    const mongoCollection = process.env.MONGO_COLLECTION || 'temperatures';

    const url = `mongodb://${mongoHost}:${mongoPort}/${mongoDatabase}`;
    // Connect to the MongoDB server
    console.log(`Connecting to MongoDB server at ${url}`);
    const client = new MongoClient(url);
    await client.connect();

    // Select the 'temperatures' collection
    const db = client.db(mongoDatabase);
    const collection = db.collection(mongoCollection);

    // Parse the start and end dates using the Luxon library
    const start = DateTime.fromISO(argv.start);
    const end = DateTime.fromISO(argv.end);

    // Calculate the time range between the start and end dates
    const duration = end.diff(start);
    const totalSeconds = duration.as('seconds');

    // Calculate the interval between data points
    const maxDataPoints = argv.max || Infinity;
    const intervalSeconds = Math.ceil(totalSeconds / maxDataPoints);
    console.log(`Interval: ${intervalSeconds} seconds`);

    console.log('start', start.toJSDate());
    console.log('end', end.toJSDate());

    let cursor = collection.find().limit(3);
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      console.log('doc', doc);
    }

    // Query the temperatures between the start and end dates
    cursor = collection.find({
      date: {
        $gte: start.toJSDate(),
        $lte: end.toJSDate()
      }
    });

    // Display the CSV header
    console.log('ID,Date,Temperature');

    // Iterate over the cursor and select equally distributed data points
    let index = 0;
    let nextTimestamp = start.toMillis();
    while (await cursor.hasNext()) {
      console.log('nextTimestamp', nextTimestamp);
      const doc = await cursor.next();
      if (!doc) {
        console.error('No data found.');
        break;
      }

      // Skip the data points that are not within the interval
      const timestamp = doc.date.getTime();
      if (timestamp < nextTimestamp) {
        continue;
      }

      // Display the data point in CSV format
      const date = DateTime.fromJSDate(doc.date).toISODate();
      console.log(`${index},${date},${doc.temperature}`);

      // Calculate the timestamp of the next data point
      nextTimestamp += intervalSeconds * 1000;
      index++;

      // Stop the iteration if the maximum number of data points has been reached
      if (index >= maxDataPoints) {
        break;
      }
    }

    // Close the MongoDB connection
    await client.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
