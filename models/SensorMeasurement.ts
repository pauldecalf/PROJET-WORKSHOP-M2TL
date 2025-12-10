import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// =============================
// MESURES (TIME-SERIES)
// =============================

export interface ISensorMeasurement extends Document {
  sensorId: Types.ObjectId;
  measuredAt: Date;
  numericValue?: number;
  rawValue?: Record<string, any>;
  createdAt: Date;
}

const SensorMeasurementSchema = new Schema<ISensorMeasurement>(
  {
    sensorId: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
    },
    measuredAt: {
      type: Date,
      required: true,
    },
    numericValue: {
      type: Number,
    },
    rawValue: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    // Note: Pour une vraie collection time-series MongoDB 5.0+, 
    // créez-la manuellement avec db.createCollection() et retirez timestamps
  }
);

// Index composé pour les requêtes temporelles
SensorMeasurementSchema.index({ sensorId: 1, measuredAt: -1 });

export const SensorMeasurement: Model<ISensorMeasurement> =
  mongoose.models.SensorMeasurement ||
  mongoose.model<ISensorMeasurement>('SensorMeasurement', SensorMeasurementSchema);

