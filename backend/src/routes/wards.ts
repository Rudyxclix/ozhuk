import { FastifyPluginAsync } from 'fastify';

export interface WardRecord {
  wardNumber: string;
  wardName: string;
  division: string;
  leadOfficer: string;
  localBody?: string;
  district?: string;
  lat?: number;
  lng?: number;
}

export interface OfficerRecord {
  id: string;
  name: string;
  wardNumber: string;
  role: string;
}

// Kochi Municipal Corporation - Ernakulam District
export const WARDS_LIST: (WardRecord & { lat: number; lng: number })[] = [
  { wardNumber: '03', wardName: 'Marine Central', division: 'Division 1', leadOfficer: 'Officer R. DSilva', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 9.9782, lng: 76.2755 },
  { wardNumber: '08', wardName: 'Kaloor North', division: 'Division 2', leadOfficer: 'Supervisor Standby', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 9.9981, lng: 76.2995 },
  { wardNumber: '11', wardName: 'Railway Sector', division: 'Division 3', leadOfficer: 'Officer V. Chacko', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 9.9820, lng: 76.2870 },
  { wardNumber: '14', wardName: 'Vyttila Central', division: 'Division 4', leadOfficer: 'Insp. K. Menon', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 9.9674, lng: 76.3182 },
  { wardNumber: '19', wardName: 'Edappally Reach', division: 'Division 4', leadOfficer: 'Officer T. George', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 10.0240, lng: 76.3080 },
  { wardNumber: '21', wardName: 'Coastal Reach', division: 'Division 5', leadOfficer: 'Officer P. Das', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 9.9350, lng: 76.2780 },
  { wardNumber: '32', wardName: 'Marine Drive East', division: 'Division 1', leadOfficer: 'Officer S. Varma', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 9.9850, lng: 76.2790 },
  { wardNumber: '41', wardName: 'Fort Kochi Outflow', division: 'Division 6', leadOfficer: 'Officer A. Joshi', localBody: 'Kochi Municipal Corporation', district: 'Ernakulam', lat: 9.9650, lng: 76.2420 },
];

export const OFFICERS_LIST: OfficerRecord[] = [
  { id: 'off-1', name: 'Insp. K. Menon', wardNumber: '14', role: 'Ward 14 Lead' },
  { id: 'off-2', name: 'Officer R. DSilva', wardNumber: '03', role: 'Ward 03 Officer' },
  { id: 'off-3', name: 'Officer V. Chacko', wardNumber: '11', role: 'Field Operations' },
  { id: 'off-4', name: 'Officer P. Das', wardNumber: '21', role: 'Drainage Rapid Squad' },
  { id: 'off-5', name: 'Er. S. Nair', wardNumber: '14', role: 'Civil Maintenance Engineer' },
];

// Great-circle distance using Haversine formula (km)
function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

// Bounding box definitions for district identification in Kerala
interface DistrictBoundary {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const KERALA_DISTRICTS: DistrictBoundary[] = [
  { name: 'Thrissur', minLat: 10.20, maxLat: 10.75, minLng: 75.85, maxLng: 76.60 },
  { name: 'Ernakulam', minLat: 9.75, maxLat: 10.25, minLng: 76.10, maxLng: 76.80 },
  { name: 'Alappuzha', minLat: 9.10, maxLat: 9.80, minLng: 76.20, maxLng: 76.60 },
  { name: 'Kottayam', minLat: 9.40, maxLat: 9.90, minLng: 76.40, maxLng: 77.00 },
  { name: 'Thiruvananthapuram', minLat: 8.25, maxLat: 8.90, minLng: 76.70, maxLng: 77.30 },
  { name: 'Kozhikode', minLat: 11.10, maxLat: 11.75, minLng: 75.60, maxLng: 76.15 },
  { name: 'Malappuram', minLat: 10.70, maxLat: 11.35, minLng: 75.80, maxLng: 76.55 },
  { name: 'Palakkad', minLat: 10.40, maxLat: 11.20, minLng: 76.25, maxLng: 76.95 },
];

export const wardRoutes: FastifyPluginAsync = async (fastify) => {
  // Return full ward list (for dropdowns / manual selection)
  fastify.get('/', async () => {
    return { data: WARDS_LIST, count: WARDS_LIST.length };
  });

  // Return officer directory
  fastify.get('/officers', async () => {
    return { data: OFFICERS_LIST, count: OFFICERS_LIST.length };
  });

  // GET /api/wards/detect?lat=...&lng=...
  // Determines ward based on prototype centroid proximity (4.0 km Haversine radius around ward centroids)
  // Strictly rejects invalid coordinates, identifies district, and NEVER falls back to Ernakulam for Thrissur or other areas
  fastify.get('/detect', async (request, reply) => {
    const query = request.query as {
      lat?: string;
      latitude?: string;
      lng?: string;
      lon?: string;
      longitude?: string;
    };

    const rawLat = query.lat !== undefined ? query.lat : query.latitude;
    const rawLng = query.lng !== undefined ? query.lng : (query.lon !== undefined ? query.lon : query.longitude);

    if (rawLat === undefined || rawLng === undefined || rawLat.trim() === '' || rawLng.trim() === '') {
      return reply.code(400).send({
        error: 'Validation failed',
        message: 'Latitude and longitude query parameters are required (e.g. ?lat=9.9674&lng=76.3182).',
      });
    }

    const lat = parseFloat(rawLat);
    const lng = parseFloat(rawLng);

    if (isNaN(lat) || isNaN(lng)) {
      return reply.code(400).send({
        error: 'Validation failed',
        message: 'Latitude and longitude must be valid numerical values.',
      });
    }

    // Latitude validation: -90 to 90
    if (lat < -90 || lat > 90) {
      return reply.code(400).send({
        error: 'Validation failed',
        message: `Invalid latitude ${lat}. Latitude must be between -90 and 90.`,
      });
    }

    // Longitude validation: -180 to 180
    if (lng < -180 || lng > 180) {
      return reply.code(400).send({
        error: 'Validation failed',
        message: `Invalid longitude ${lng}. Longitude must be between -180 and 180.`,
      });
    }

    // Identify district in Kerala based on coordinates
    const matchedDistrict = KERALA_DISTRICTS.find(
      (d) => lat >= d.minLat && lat <= d.maxLat && lng >= d.minLng && lng <= d.maxLng
    );

    const districtName = matchedDistrict ? matchedDistrict.name : null;
    const regionName = matchedDistrict ? `${matchedDistrict.name}, Kerala` : 'Outside Covered Jurisdiction';

    // Check Kochi Municipal Corporation coverage
    // Kochi Corporation bounds: lat [9.90, 10.06], lng [76.22, 76.36]
    const inKochiBounds = lat >= 9.90 && lat <= 10.06 && lng >= 76.22 && lng <= 76.36;

    // Find closest ward among defined Kochi wards
    let closestWard: (WardRecord & { lat: number; lng: number }) | null = null;
    let minDistance = Infinity;

    for (const ward of WARDS_LIST) {
      const dist = haversineDistanceKm(lat, lng, ward.lat, ward.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestWard = ward;
      }
    }

    // Maximum distance threshold for Kochi ward catchment: 4.0 km
    const MAX_WARD_RADIUS_KM = 4.0;

    if (inKochiBounds && closestWard && minDistance <= MAX_WARD_RADIUS_KM) {
      return {
        matched: true,
        ward: {
          wardNumber: closestWard.wardNumber,
          wardName: closestWard.wardName,
          division: closestWard.division,
          leadOfficer: closestWard.leadOfficer,
          localBody: closestWard.localBody || 'Kochi Municipal Corporation',
          district: 'Ernakulam',
        },
        district: 'Ernakulam',
        localBody: 'Kochi Municipal Corporation',
        region: 'Kochi, Ernakulam, Kerala',
        distanceKm: Math.round(minDistance * 100) / 100,
        message: `Ward ${closestWard.wardNumber} (${closestWard.wardName}) identified.`,
      };
    }

    // If coordinate is in Thrissur:
    if (districtName === 'Thrissur') {
      return {
        matched: false,
        ward: null,
        district: 'Thrissur',
        localBody: null,
        region: 'Thrissur, Kerala',
        message: 'Ward could not be determined for this location. Coordinate is in Thrissur district; municipal ward boundaries for Thrissur are not yet covered in this prototype deployment.',
      };
    }

    // Any other location outside covered ward catchment:
    return {
      matched: false,
      ward: null,
      district: districtName,
      localBody: null,
      region: regionName,
      message: 'Ward could not be determined for this location. Coordinate falls outside covered municipal ward zones.',
    };
  });
};
