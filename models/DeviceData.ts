import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// =============================
// DONNÉES DES DEVICES (TIME-SERIES)
// =============================

export interface IDeviceData extends Document {
  deviceId: Types.ObjectId;
  serialNumber?: string;
  temperature?: number;      // en °C
  humidity?: number;         // en %
  co2?: number;             // en ppm
  decibel?: number;         // en dB
  luminosity?: number;      // en %
  measuredAt: Date;
  createdAt: Date;
}

const DeviceDataSchema = new Schema<IDeviceData>(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    serialNumber: {
      type: String,
      maxlength: 100,
    },
    temperature: {
      type: Number,
      min: -50,
      max: 100,
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100,
    },
    co2: {
      type: Number,
      min: 0,
      max: 10000,
    },
    decibel: {
      type: Number,
      min: 0,
      max: 200,
    },
    luminosity: {
      type: Number,
      min: 0,
      max: 100,
    },
    measuredAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index composé pour les requêtes temporelles
DeviceDataSchema.index({ deviceId: 1, measuredAt: -1 });
DeviceDataSchema.index({ serialNumber: 1, measuredAt: -1 });
DeviceDataSchema.index({ measuredAt: -1 });

export const DeviceData: Model<IDeviceData> =
  mongoose.models.DeviceData ||
  mongoose.model<IDeviceData>('DeviceData', DeviceDataSchema);





