import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { RoomAvailability } from '@/types/enums';

// =============================
// STATUT DES SALLES (DASHBOARD ÉTUDIANT)
// =============================

export interface IRoomStatus extends Document {
  roomId: Types.ObjectId;
  availability: RoomAvailability;
  lastUpdateAt: Date;
  sourceDeviceId?: Types.ObjectId;
  sourceSensorId?: Types.ObjectId;
  reason?: string;
}

const RoomStatusSchema = new Schema<IRoomStatus>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      unique: true,
    },
    availability: {
      type: String,
      enum: Object.values(RoomAvailability),
      required: true,
      default: RoomAvailability.UNKNOWN,
    },
    lastUpdateAt: {
      type: Date,
      required: true,
    },
    sourceDeviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
    },
    sourceSensorId: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
    },
    reason: {
      type: String,
      maxlength: 255,
    },
  },
  {
    timestamps: false,
  }
);

// Index pour les requêtes fréquentes
RoomStatusSchema.index({ availability: 1 });
RoomStatusSchema.index({ lastUpdateAt: -1 });

export const RoomStatus: Model<IRoomStatus> =
  mongoose.models.RoomStatus ||
  mongoose.model<IRoomStatus>('RoomStatus', RoomStatusSchema);





