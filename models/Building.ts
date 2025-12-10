import mongoose, { Schema, Document, Model } from 'mongoose';

// =============================
// BÂTIMENTS
// =============================

export interface IBuilding extends Document {
  name: string;
  address?: string;
  totalFloors?: number;
  mapImageUrl?: string;
  createdAt: Date;
}

const BuildingSchema = new Schema<IBuilding>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    address: {
      type: String,
      maxlength: 255,
    },
    totalFloors: {
      type: Number,
      min: 1,
      max: 100,
    },
    mapImageUrl: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

export const Building: Model<IBuilding> =
  mongoose.models.Building || mongoose.model<IBuilding>('Building', BuildingSchema);

