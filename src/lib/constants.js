export const HIJRI_YEAR = '1448';
export const DRAFT_KEY = 'hidayat-draft-v2';
export const APP_PREFIX = 'hidayat-app-v2-';
export const MAX_FILE_MB = 2;
export const MIN_FORM_TIME = 15000;
export const TOTAL_STEPS = 4;

export const CENTERS = {
  Sirsaganj: { code: 'SIR', capacity: 200, morning: 100, afternoon: 100, map: 'Sirsaganj,+Firozabad,+Uttar+Pradesh' },
  Karhel:    { code: 'KAR', capacity: 150, morning: 75,  afternoon: 75,  map: 'Karhel,+Delhi' },
  Shikohabad:{ code: 'SHI', capacity: 120, morning: 60,  afternoon: 60,  map: 'Shikohabad,+Uttar+Pradesh' },
  Firozabad: { code: 'FIR', capacity: 180, morning: 90,  afternoon: 90,  map: 'Firozabad,+Uttar+Pradesh' },
  Mainpuri:  { code: 'MAI', capacity: 100, morning: 50,  afternoon: 50,  map: 'Mainpuri,+Uttar+Pradesh' },
};

export const SLOT_TIMES = {
  Morning: '9:00 AM – 12:00 PM',
  Afternoon: '2:00 PM – 5:00 PM',
};

export const STEP_TITLES = [
  'Personal Information',
  'Contact & Address',
  'Education & Preferences',
  'Review & Submit',
];