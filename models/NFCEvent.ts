import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// =============================
// ÉVÉNEMENTS NFC
// =============================

export interface INFCEvent extends Document {
  sensorId: Types.ObjectId;
  badgeId?: Types.ObjectId;
  eventType?: string;
  eventAt: Date;
  rawPayload?: Record<string, any>;
  createdAt: Date;
}

const NFCEventSchema = new Schema<INFCEvent>(
  {
    sensorId: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
    },
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: 'NFCBadge',
    },
    eventType: {
      type: String,
      maxlength: 50,
    },
    eventAt: {
      type: Date,
      required: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Index pour les requêtes temporelles
NFCEventSchema.index({ sensorId: 1, eventAt: -1 });
NFCEventSchema.index({ badgeId: 1, eventAt: -1 });

export const NFCEvent: Model<INFCEvent> =
  mongoose.models.NFCEvent || mongoose.model<INFCEvent>('NFCEvent', NFCEventSchema);

