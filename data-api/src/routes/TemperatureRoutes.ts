import { Router, Request, Response } from 'express';
import { TemperatureService } from '../TemperatureService';

export class TemperatureRoutes {
  public router: Router;

  constructor(private temperatureService: TemperatureService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/', async (req: Request, res: Response) => {
      const temperatures = await this.temperatureService.getTemperatures();
      res.json(temperatures);
    });
  }
}
