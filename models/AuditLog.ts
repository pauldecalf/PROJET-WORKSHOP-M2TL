import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// =============================
// AUDIT LOG
// =============================

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      maxlength: 100,
    },
    entityType: {
      type: String,
      maxlength: 50,
    },
    entityId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour les requêtes d'audit
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ action: 1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

