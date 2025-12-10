import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { OTAStatus } from '@/types/enums';

// =============================
// MISES À JOUR OTA
// =============================

export interface IOTAUpdate extends Document {
  deviceId: Types.ObjectId;
  targetVersion: string;
  status: OTAStatus;
  createdByUserId?: Types.ObjectId;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  log?: string;
}

const OTAUpdateSchema = new Schema<IOTAUpdate>(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    targetVersion: {
      type: String,
      required: true,
      maxlength: 50,
    },
    status: {
      type: String,
      enum: Object.values(OTAStatus),
      required: true,
      default: OTAStatus.SCHEDULED,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    log: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour les requêtes fréquentes
OTAUpdateSchema.index({ deviceId: 1, createdAt: -1 });
OTAUpdateSchema.index({ status: 1 });

export const OTAUpdate: Model<IOTAUpdate> =
  mongoose.models.OTAUpdate ||
  mongoose.model<IOTAUpdate>('OTAUpdate', OTAUpdateSchema);

