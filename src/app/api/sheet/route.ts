import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const dynamic = 'force-dynamic';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const safeParseFloat = (value: string | undefined) => {
  if (value === undefined || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Function to split date and time
const splitDateTime = (timestamp: string) => {
  if (!timestamp) return { date: null, time: null };
  
  const [datePart, timePart] = timestamp.split(' ');
  return {
    date: datePart || null,
    time: timePart || null
  };
};

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    const data = rows.map(row => {
      const timestamp = row.get('Date()') || row.get('Date') || row.get('date');
      const { date, time } = splitDateTime(timestamp);

      return {
        date,  // "2024-12-07"
        time,  // "11:19:22"
        inputPower: safeParseFloat(row.get('Input Power')),
        outputPower: safeParseFloat(row.get('Output Power')),
        solarPower: safeParseFloat(row.get('Solar Power')),
        inputEnergy: safeParseFloat(row.get('Input Energy')),
        outputEnergy: safeParseFloat(row.get('Output Energy')),
        solarEnergy: safeParseFloat(row.get('Solar Energy')),
        inputVoltage: safeParseFloat(row.get('Input Voltage')),
        inputCurrent: safeParseFloat(row.get('Input Current')),
        outputVoltage: safeParseFloat(row.get('Output Voltage')),
        outputCurrent: safeParseFloat(row.get('Output Current')),
        solarVoltage: safeParseFloat(row.get('Solar Voltage')),
        solarCurrent: safeParseFloat(row.get('Solar Current')),
        battVoltage: safeParseFloat(row.get('Batt voltage')),
        energySaved: safeParseFloat(row.get('Energy Saved')),
      };
    });

    console.log('Successfully fetched data:', data);
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return Response.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}