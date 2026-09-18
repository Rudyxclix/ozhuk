import mongoose, { Schema, Document } from 'mongoose';
import { DrainageCategory, SeverityLevel, ReportStatus } from '../types/index.js';

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ReportDocument extends Document {
  ticketId: string;
  reporterId?: string | null;
  category: DrainageCategory;
  severity: SeverityLevel;
  status: ReportStatus;
  ward: {
    number: string;
    name: string;
    division?: string;
    officerInCharge?: string;
    localBody?: string | null;
  };
  location: GeoJSONPoint;
  landmark: string;
  description: string;
  photoFileName?: string;
  photoUrl?: string;
  reportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedOfficerId?: string | null;
  assignedTo?: string | null;
  assignedAt?: Date | null;
  slaDeadline?: Date | null;
  isSlaBreached: boolean;
  escalatedAt?: Date | null;
  resolvedAt?: Date | null;
  resolutionPhotoUrl?: string;
  resolutionNotes?: string;
  isDemo?: boolean;
}

const GeoJSONPointSchema = new Schema<GeoJSONPoint>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (coords: number[]) => coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]),
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false }
);

const ReportSchema = new Schema<ReportDocument>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    reporterId: { type: String, default: null },
    category: {
      type: String,
      enum: ['STORM_DRAIN', 'CANAL', 'CULVERT', 'OTHER'],
      default: 'STORM_DRAIN',
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      required: true,
    },
    status: {
      type: String,
      enum: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'],
      default: 'REPORTED',
      index: true,
      required: true,
    },
    ward: {
      number: { type: String, required: true, index: true },
      name: { type: String, required: true },
      division: { type: String },
      officerInCharge: { type: String },
      localBody: { type: String, default: null },
    },
    location: {
      type: GeoJSONPointSchema,
      required: true,
    },
    landmark: { type: String, required: true },
    description: { type: String, required: true },
    photoFileName: { type: String },
    photoUrl: { type: String, default: '' },
    reportedAt: { type: Date, required: true, default: Date.now },
    assignedOfficerId: { type: String, default: null },
    assignedTo: { type: String, default: null },
    assignedAt: { type: Date, default: null },
    slaDeadline: { type: Date, default: null },
    isSlaBreached: { type: Boolean, default: false },
    escalatedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    resolutionPhotoUrl: { type: String },
    resolutionNotes: { type: String },
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = ret._id ? String(ret._id) : undefined;
        delete ret._id;
        delete ret.__v;

        // Ensure location exposes latitude/longitude structure expected by frontend
        if (ret.location && typeof ret.location === 'object') {
          const loc = ret.location as { coordinates?: [number, number]; type?: string };
          if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
            ret.location = {
              latitude: loc.coordinates[1],
              longitude: loc.coordinates[0],
              landmark: ret.landmark,
            };
          }
        }

        // Map ward structure for frontend backwards compatibility
        if (ret.ward && typeof ret.ward === 'object') {
          const w = ret.ward as { number?: string; name?: string; division?: string; officerInCharge?: string; localBody?: string | null };
          ret.ward = {
            wardNumber: w.number,
            wardName: w.name,
            division: w.division,
            officerInCharge: w.officerInCharge,
            localBody: w.localBody || null,
          };
        }

        // Convert Date objects to ISO strings for API serialization
        if (ret.reportedAt instanceof Date) ret.reportedAt = ret.reportedAt.toISOString();
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
        if (ret.assignedAt instanceof Date) ret.assignedAt = ret.assignedAt.toISOString();
        if (ret.slaDeadline instanceof Date) ret.slaDeadline = ret.slaDeadline.toISOString();
        if (ret.escalatedAt instanceof Date) ret.escalatedAt = ret.escalatedAt.toISOString();
        if (ret.resolvedAt instanceof Date) ret.resolvedAt = ret.resolvedAt.toISOString();

        return ret;
      },
    },
  }
);

// 2dsphere index on location coordinates for geospatial ward lookup and map queries
ReportSchema.index({ location: '2dsphere' });

export const ReportModel = mongoose.model<ReportDocument>('Report', ReportSchema);
