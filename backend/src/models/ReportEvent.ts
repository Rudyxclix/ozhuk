import mongoose, { Schema, Document } from 'mongoose';

export interface ReportEventDocument extends Document {
  reportId: mongoose.Types.ObjectId;
  ticketId: string;
  action: string;
  previousStatus: string | null;
  newStatus: string;
  actorId: string | null;
  actor: string;
  notes?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const ReportEventSchema = new Schema<ReportEventDocument>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
    ticketId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    previousStatus: { type: String, default: null },
    newStatus: { type: String, required: true },
    actorId: { type: String, default: null },
    actor: { type: String, required: true, default: 'Citizen' },
    notes: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = ret._id ? String(ret._id) : undefined;
        delete ret._id;
        delete ret.__v;
        if (ret.timestamp instanceof Date) {
          ret.timestamp = ret.timestamp.toISOString();
        }
        return ret;
      },
    },
  }
);

ReportEventSchema.index({ ticketId: 1, timestamp: 1 });

export const ReportEventModel = mongoose.model<ReportEventDocument>('ReportEvent', ReportEventSchema);
