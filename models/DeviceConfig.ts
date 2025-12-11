import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// =============================
// HISTORIQUE DE CONFIGURATION DES DEVICES
// =============================

export interface IDeviceConfig extends Document {
  deviceId: Types.ObjectId;
  samplingIntervalSec: number;
  dataVisibilityPublic: boolean;
  ledAutoControl: boolean;
  createdByUserId?: Types.ObjectId;
  createdAt: Date;
}

const DeviceConfigSchema = new Schema<IDeviceConfig>(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    samplingIntervalSec: {
      type: Number,
      required: true,
    },
    dataVisibilityPublic: {
      type: Boolean,
      default: true,
    },
    ledAutoControl: {
      type: Boolean,
      default: true,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour récupérer l'historique d'un device
DeviceConfigSchema.index({ deviceId: 1, createdAt: -1 });

export const DeviceConfig: Model<IDeviceConfig> =
  mongoose.models.DeviceConfig ||
  mongoose.model<IDeviceConfig>('DeviceConfig', DeviceConfigSchema);





