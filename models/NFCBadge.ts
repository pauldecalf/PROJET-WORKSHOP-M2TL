import mongoose, { Schema, Document, Model } from 'mongoose';

// =============================
// NFC & ANONYMISATION
// =============================

export interface INFCBadge extends Document {
  badgeHash: string;
  type?: string;
  createdAt: Date;
}

const NFCBadgeSchema = new Schema<INFCBadge>(
  {
    badgeHash: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },
    type: {
      type: String,
      maxlength: 50,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// L'index sur badgeHash est déjà créé automatiquement par "unique: true"

export const NFCBadge: Model<INFCBadge> =
  mongoose.models.NFCBadge || mongoose.model<INFCBadge>('NFCBadge', NFCBadgeSchema);

