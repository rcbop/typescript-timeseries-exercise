import { ObjectId } from 'mongodb'

export interface Temperature {
    value: number;
    date: Date;
}

export interface TemperatureDocument {
    _id: ObjectId;
    metadata: {
        date: Date;
    };
}
