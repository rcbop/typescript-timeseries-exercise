
import { TemperatureService } from '../src/TemperatureService';
import { MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('TemperatureService', () => {
  let temperatureService: TemperatureService;
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    mongoClient = new MongoClient(mongoUri);
    temperatureService = new TemperatureService(mongoClient, 'test', 'temperatures');
    await temperatureService.connect();
  });

  beforeEach(async () => {
    await temperatureService.getCollection()!.deleteMany({});
  });

  afterAll(async () => {
    await temperatureService.disconnect();
    await mongoServer.stop();
  });

  it('should be defined', () => {
    expect(temperatureService).toBeDefined();
  });

  it('should create a new temperature', async () => {
    const temperature = { timestamp: new Date().toISOString(), value: 21 };
    const result = await temperatureService.createTemperature(temperature);
    expect(result.acknowledged).toBeTruthy();
    expect(result.insertedId).toBeDefined();
    expect(result.insertedId).toBeInstanceOf(ObjectId);
  });

  it('should get all temperatures', async () => {
    const temperaturesTobeInserted = [
      { timestamp: new Date().toISOString(), value: 21 },
      { timestamp: new Date().toISOString(), value: 22 },
      { timestamp: new Date().toISOString(), value: 23 },
    ];
    await temperatureService.getCollection()!.insertMany(temperaturesTobeInserted);

    const temperatures = await temperatureService.getTemperatures();
    expect(temperatures.length).toBeGreaterThan(0);
    expect(temperatures.length).toEqual(temperaturesTobeInserted.length);
    for (let i = 0; i < temperatures.length; i++) {
      expect(temperatures[i]).toHaveProperty('_id');
      expect(temperatures[i]).toHaveProperty('timestamp');
      expect(temperatures[i]).toHaveProperty('value');
      expect(temperatures[i].value).toEqual(temperaturesTobeInserted[i].value);
    }
  });
});
