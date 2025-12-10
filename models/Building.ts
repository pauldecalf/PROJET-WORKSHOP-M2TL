import mongoose, { Schema, Document, Model } from 'mongoose';

// =============================
// BÂTIMENTS
// =============================

export interface IBuilding extends Document {
  name: string;
  address?: string;
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
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

export const Building: Model<IBuilding> =
  mongoose.models.Building || mongoose.model<IBuilding>('Building', BuildingSchema);

