import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { SensorType } from '@/types/enums';

// =============================
// CAPTEURS
// =============================

export interface ISensor extends Document {
  deviceId: Types.ObjectId;
  type: SensorType;
  label?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  createdAt: Date;
}

const SensorSchema = new Schema<ISensor>(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(SensorType),
      required: true,
    },
    label: {
      type: String,
      maxlength: 100,
    },
    unit: {
      type: String,
      maxlength: 20,
    },
    minValue: {
      type: Number,
    },
    maxValue: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour les requêtes par device
SensorSchema.index({ deviceId: 1 });
SensorSchema.index({ type: 1 });

export const Sensor: Model<ISensor> =
  mongoose.models.Sensor || mongoose.model<ISensor>('Sensor', SensorSchema);

