import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/types/enums';

// =============================
// UTILISATEURS
// =============================

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  displayName?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    displayName: {
      type: String,
      maxlength: 100,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour la recherche par email
UserSchema.index({ email: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

