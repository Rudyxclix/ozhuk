import { FastifyPluginAsync } from 'fastify';

export interface WardRecord {
  wardNumber: string;
  wardName: string;
  division: string;
  leadOfficer: string;
}

export const WARDS_LIST: WardRecord[] = [
  { wardNumber: '03', wardName: 'Marine Central', division: 'Division 1', leadOfficer: 'Officer R. DSilva' },
  { wardNumber: '08', wardName: 'Kaloor North', division: 'Division 2', leadOfficer: 'Supervisor Standby' },
  { wardNumber: '11', wardName: 'Railway Sector', division: 'Division 3', leadOfficer: 'Officer V. Chacko' },
  { wardNumber: '14', wardName: 'Vyttila Central', division: 'Division 4', leadOfficer: 'Insp. K. Menon' },
  { wardNumber: '19', wardName: 'Edappally Reach', division: 'Division 4', leadOfficer: 'Officer T. George' },
  { wardNumber: '21', wardName: 'Coastal Reach', division: 'Division 5', leadOfficer: 'Officer P. Das' },
  { wardNumber: '32', wardName: 'Marine Drive East', division: 'Division 1', leadOfficer: 'Officer S. Varma' },
  { wardNumber: '41', wardName: 'Fort Kochi Outflow', division: 'Division 6', leadOfficer: 'Officer A. Joshi' },
];

export const OFFICERS_LIST = [
  { id: 'off-1', name: 'Insp. K. Menon', wardNumber: '14', role: 'Ward 14 Lead' },
  { id: 'off-2', name: 'Officer R. DSilva', wardNumber: '03', role: 'Ward 03 Officer' },
  { id: 'off-3', name: 'Officer V. Chacko', wardNumber: '11', role: 'Field Operations' },
  { id: 'off-4', name: 'Officer P. Das', wardNumber: '21', role: 'Drainage Rapid Squad' },
  { id: 'off-5', name: 'Er. S. Nair', wardNumber: '14', role: 'Civil Maintenance Engineer' },
];

export const wardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return { data: WARDS_LIST, count: WARDS_LIST.length };
  });

  fastify.get('/officers', async () => {
    return { data: OFFICERS_LIST, count: OFFICERS_LIST.length };
  });
};
