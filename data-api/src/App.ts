import express, { Application } from 'express';
import { TemperatureService } from './TemperatureService';
import { TemperatureRoutes } from './routes/TemperatureRoutes';
import { MongoClient } from 'mongodb';

export class App {
  private app: Application;
  private temperatureService: TemperatureService;

  constructor() {
    this.app = express();
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be set');
    }
    const client = new MongoClient(process.env.MONGO_URI);
    this.temperatureService = new TemperatureService(client, 'mydb', 'temperatures');
    this.setupRoutes();
  }

  async start(): Promise<void> {
    await this.temperatureService.connect();
    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  }

  async stop(): Promise<void> {
    await this.temperatureService.disconnect();
  }

  private setupRoutes() {
    const temperatureRoutes = new TemperatureRoutes(this.temperatureService);
    this.app.use('/temperatures', temperatureRoutes.router);
  }
}
