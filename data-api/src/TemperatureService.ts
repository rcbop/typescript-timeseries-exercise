import { Collection, MongoClient, WithId } from 'mongodb';

export class TemperatureService {
  private collection: Collection | undefined;
  private client: MongoClient;
  private dbName: string;
  private collectionName: string;

  constructor(client: MongoClient, dbName: string, collectionName: string) {
    this.client = client;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  getCollection(): Collection | undefined {
    return this.collection;
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.collection = this.client.db(this.dbName).collection(this.collectionName);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async getTemperatures(limit: number = 100): Promise<any[]> {
    return await this.collection!.find().sort({ timestamp: -1 }).limit(limit).toArray();
  }

  async createTemperature(temperature: any): Promise<any> {
    return await this.collection!.insertOne(temperature);
  }
}
