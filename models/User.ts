import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { UserRole } from '@/types/enums';

// =============================
// UTILISATEURS
// =============================

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  displayName?: string;
  badgeId?: Types.ObjectId;
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
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: 'NFCBadge',
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// L'index sur email est déjà créé automatiquement par "unique: true"

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

