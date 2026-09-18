import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { ReportModel } from '../models/Report.js';
import { ReportEventModel } from '../models/ReportEvent.js';
import { DrainageCategory, SeverityLevel, ReportStatus } from '../types/index.js';

interface DemoSeedItem {
  ticketId: string;
  category: DrainageCategory;
  severity: SeverityLevel;
  status: ReportStatus;
  ward: {
    number: string;
    name: string;
    division: string;
    officerInCharge: string;
    localBody?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  landmark: string;
  description: string;
  photoUrl: string;
  photoFileName: string;
  reportedAt: Date;
  assignedTo?: string;
  assignedAt?: Date;
  slaDeadline: Date;
  isSlaBreached: boolean;
  resolutionPhotoUrl?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  events: Array<{
    action: string;
    actor: string;
    notes?: string;
    previousStatus: string | null;
    newStatus: string;
    timestamp: Date;
  }>;
}

// Stitch-inspired realistic demo incidents, explicitly marked as demo records
const DEMO_SEEDS: DemoSeedItem[] = [
  {
    ticketId: 'OZH-260916-001',
    category: 'STORM_DRAIN',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    ward: {
      number: '14',
      name: 'Vyttila Central',
      division: 'Division 4',
      officerInCharge: 'Insp. K. Menon',
    },
    location: {
      type: 'Point',
      coordinates: [76.3182, 9.9674], // [lng, lat]
    },
    landmark: 'Near Crossroad Junction North, 9th Cross',
    description: 'Plastic packaging and debris blocking storm drain near crossroad. Overflowing onto walkway.',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmE6uzfa2iABqoGZ4ZFDwlsfd4enFDV0980HCqMoHoPnlmEnbZhm1yny0111R_UojNvI2L7xYZNQmOO3gJe_0VjuRohhwSinGmK4jOTJBWAkXj0XklZ-xtXe1ABk02uLRx4xx0r26tPDYH_t-G68RfCljjj8XzWMJzDfLPQAiWm_zGVi1W2SCjG0ENGC5mowK4bR0wOOlbrHuOMD0yn6eYssgHbx3UMTA-Z3i9JdRZykYPvvRO8Q-FQg',
    photoFileName: 'clog_market_junction.jpg',
    reportedAt: new Date('2026-09-16T21:14:00Z'),
    assignedTo: 'Insp. K. Menon',
    assignedAt: new Date('2026-09-16T22:30:00Z'),
    slaDeadline: new Date('2026-09-17T21:14:00Z'),
    isSlaBreached: false,
    events: [
      {
        action: 'REPORT_SUBMITTED',
        actor: 'Citizen',
        notes: 'Submitted via citizen reporting portal (Demo)',
        previousStatus: null,
        newStatus: 'REPORTED',
        timestamp: new Date('2026-09-16T21:14:00Z'),
      },
      {
        action: 'OFFICER_ASSIGNED',
        actor: 'Dispatch System',
        notes: 'Assigned to Insp. K. Menon',
        previousStatus: 'REPORTED',
        newStatus: 'ASSIGNED',
        timestamp: new Date('2026-09-16T22:30:00Z'),
      },
      {
        action: 'STATUS_UPDATED',
        actor: 'Insp. K. Menon',
        notes: 'Field desilting crew on site',
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        timestamp: new Date('2026-09-17T07:45:00Z'),
      },
    ],
  },
  {
    ticketId: 'OZH-260916-002',
    category: 'CANAL',
    severity: 'CRITICAL',
    status: 'ESCALATED',
    ward: {
      number: '08',
      name: 'Kaloor North',
      division: 'Division 2',
      officerInCharge: 'Supervisor Standby',
    },
    location: {
      type: 'Point',
      coordinates: [76.2995, 9.9981], // [lng, lat]
    },
    landmark: 'Behind Stadium Link Road Canal Bridge',
    description: 'Fallen tree branch entangled with commercial waste bags. Complete blockage causing backflow.',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAG9T-v_T6FvFkYc90Q86u5t903v4o3t0k213-9034v09k03429fk0934k02934-0934k02934k09234k09234k09234',
    photoFileName: 'canal_kaloor_stadium.jpg',
    reportedAt: new Date('2026-09-16T19:40:00Z'),
    slaDeadline: new Date('2026-09-17T07:40:00Z'),
    isSlaBreached: true,
    events: [
      {
        action: 'REPORT_SUBMITTED',
        actor: 'Citizen',
        notes: 'Submitted via citizen reporting portal (Demo)',
        previousStatus: null,
        newStatus: 'REPORTED',
        timestamp: new Date('2026-09-16T19:40:00Z'),
      },
      {
        action: 'REPORT_ESCALATED',
        actor: 'Supervisory Bot',
        notes: 'Automatic escalation: SLA breached without officer triage',
        previousStatus: 'REPORTED',
        newStatus: 'ESCALATED',
        timestamp: new Date('2026-09-17T08:00:00Z'),
      },
    ],
  },
  {
    ticketId: 'OZH-260915-045',
    category: 'STORM_DRAIN',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    ward: {
      number: '03',
      name: 'Marine Central',
      division: 'Division 1',
      officerInCharge: 'Officer R. DSilva',
    },
    location: {
      type: 'Point',
      coordinates: [76.2755, 9.9782], // [lng, lat]
    },
    landmark: 'Opposite Ferry Jetty Walkway Basin',
    description: 'Silt deposits and plastic bottles blocking grate. Cleared during morning maintenance cycle.',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmE6uzfa2iABqoGZ4ZFDwlsfd4enFDV0980HCqMoHoPnlmEnbZhm1yny0111R_UojNvI2L7xYZNQmOO3gJe_0VjuRohhwSinGmK4jOTJBWAkXj0XklZ-xtXe1ABk02uLRx4xx0r26tPDYH_t-G68RfCljjj8XzWMJzDfLPQAiWm_zGVi1W2SCjG0ENGC5mowK4bR0wOOlbrHuOMD0yn6eYssgHbx3UMTA-Z3i9JdRZykYPvvRO8Q-FQg',
    photoFileName: 'grate_ferry_jetty.jpg',
    reportedAt: new Date('2026-09-15T08:30:00Z'),
    assignedTo: 'Officer R. DSilva',
    assignedAt: new Date('2026-09-15T09:15:00Z'),
    slaDeadline: new Date('2026-09-16T08:30:00Z'),
    isSlaBreached: false,
    resolutionPhotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmE6uzfa2iABqoGZ4ZFDwlsfd4enFDV0980HCqMoHoPnlmEnbZhm1yny0111R_UojNvI2L7xYZNQmOO3gJe_0VjuRohhwSinGmK4jOTJBWAkXj0XklZ-xtXe1ABk02uLRx4xx0r26tPDYH_t-G68RfCljjj8XzWMJzDfLPQAiWm_zGVi1W2SCjG0ENGC5mowK4bR0wOOlbrHuOMD0yn6eYssgHbx3UMTA-Z3i9JdRZykYPvvRO8Q-FQg',
    resolvedAt: new Date('2026-09-15T14:20:00Z'),
    resolutionNotes: 'Culvert cleared and hydro-flushed. Water flowing freely to bay.',
    events: [
      {
        action: 'REPORT_SUBMITTED',
        actor: 'Citizen',
        previousStatus: null,
        newStatus: 'REPORTED',
        timestamp: new Date('2026-09-15T08:30:00Z'),
      },
      {
        action: 'OFFICER_ASSIGNED',
        actor: 'Supervisor Standby',
        notes: 'Assigned to Officer R. DSilva',
        previousStatus: 'REPORTED',
        newStatus: 'ASSIGNED',
        timestamp: new Date('2026-09-15T09:15:00Z'),
      },
      {
        action: 'REPORT_RESOLVED',
        actor: 'Officer R. DSilva',
        notes: 'Culvert cleared and hydro-flushed. Water flowing freely to bay.',
        previousStatus: 'ASSIGNED',
        newStatus: 'RESOLVED',
        timestamp: new Date('2026-09-15T14:20:00Z'),
      },
    ],
  },
];

async function seed(isReset = false) {
  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ Cannot seed without database connection.');
    process.exit(1);
  }

  try {
    if (isReset) {
      console.log('⚠️  Reset mode: Removing existing demo records (isDemo: true)...');
      await ReportModel.deleteMany({ isDemo: true });
      await ReportEventModel.deleteMany({ 'metadata.isDemo': true });
      console.log('🧹 Cleaned existing demo records.');
    }

    console.log('🌱 Checking demo records in MongoDB Atlas...');
    let insertedCount = 0;
    let skippedCount = 0;

    for (const seedItem of DEMO_SEEDS) {
      const existing = await ReportModel.findOne({ ticketId: seedItem.ticketId });
      if (existing) {
        console.log(`  ⏩ Ticket ${seedItem.ticketId} already exists, skipping.`);
        skippedCount++;
        continue;
      }

      const { events, ...reportData } = seedItem;
      const reportDoc = await ReportModel.create({
        ...reportData,
        isDemo: true,
      });

      // Insert associated timeline events
      for (const ev of events) {
        await ReportEventModel.create({
          reportId: reportDoc._id,
          ticketId: reportDoc.ticketId,
          action: ev.action,
          previousStatus: ev.previousStatus,
          newStatus: ev.newStatus,
          actor: ev.actor,
          notes: ev.notes,
          timestamp: ev.timestamp,
          metadata: { isDemo: true },
        });
      }

      console.log(`  ✅ Inserted demo report ${seedItem.ticketId}`);
      insertedCount++;
    }

    console.log(`\n🎉 Seeding complete: ${insertedCount} inserted, ${skippedCount} skipped.`);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

const isResetArg = process.argv.includes('--reset');
seed(isResetArg).then(() => process.exit(0));
