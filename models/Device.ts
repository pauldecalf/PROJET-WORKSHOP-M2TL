import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { DeviceStatus } from '@/types/enums';

// =============================
// BOÎTIERS / DEVICES
// =============================

export interface IDevice extends Document {
  serialNumber: string;
  name?: string;
  roomId?: Types.ObjectId;
  status: DeviceStatus;
  firmwareVersion?: string;
  batteryLevel?: number;
  isPoweredOn: boolean;
  lastSeenAt?: Date;
  createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    name: {
      type: String,
      maxlength: 100,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
    status: {
      type: String,
      enum: Object.values(DeviceStatus),
      required: true,
      default: DeviceStatus.UNKNOWN,
    },
    firmwareVersion: {
      type: String,
      maxlength: 50,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
    },
    isPoweredOn: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour les recherches courantes
// L'index sur serialNumber est déjà créé automatiquement par "unique: true"
DeviceSchema.index({ roomId: 1 });
DeviceSchema.index({ status: 1 });

export const Device: Model<IDevice> =
  mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);

