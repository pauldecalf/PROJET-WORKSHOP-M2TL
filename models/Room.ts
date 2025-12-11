import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// =============================
// SALLES
// =============================

export interface IRoom extends Document {
  buildingId: Types.ObjectId;
  name: string;
  floor?: number;
  capacity?: number;
  mapX?: number;
  mapY?: number;
  currentStatus?: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    floor: {
      type: Number,
    },
    capacity: {
      type: Number,
    },
    mapX: {
      type: Number,
    },
    mapY: {
      type: Number,
    },
    currentStatus: {
      type: String,
      maxlength: 50,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour les requêtes par bâtiment
RoomSchema.index({ buildingId: 1 });

export const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);





