import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { CommandType, CommandStatus } from '@/types/enums';

// =============================
// COMMANDES DEVICE
// =============================

export interface IDeviceCommand extends Document {
  deviceId: Types.ObjectId;
  command: CommandType;
  payload?: Record<string, any>;
  status: CommandStatus;
  createdByUserId?: Types.ObjectId;
  createdAt: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  errorMessage?: string;
}

const DeviceCommandSchema = new Schema<IDeviceCommand>(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    command: {
      type: String,
      enum: Object.values(CommandType),
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: Object.values(CommandStatus),
      required: true,
      default: CommandStatus.PENDING,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: {
      type: Date,
    },
    acknowledgedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour les requêtes fréquentes
DeviceCommandSchema.index({ deviceId: 1, createdAt: -1 });
DeviceCommandSchema.index({ status: 1 });

export const DeviceCommand: Model<IDeviceCommand> =
  mongoose.models.DeviceCommand ||
  mongoose.model<IDeviceCommand>('DeviceCommand', DeviceCommandSchema);





