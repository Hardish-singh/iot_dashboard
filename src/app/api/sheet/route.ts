import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const dynamic = 'force-dynamic';

// Validate environment variables on startup
const validateEnv = () => {
  const requiredVars = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'SHEET_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Initialize auth with proper error handling
const getAuth = () => {
  try {
    return new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    console.error('Auth initialization failed:', error);
    throw new Error('Failed to initialize Google authentication');
  }
};

const safeParseFloat = (value: string | undefined) => {
  if (value === undefined || value === '') return 0; // Return 0 instead of null for safer calculations
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const splitDateTime = (timestamp: string) => {
  if (!timestamp) return { date: 'Unknown', time: 'Unknown' };
  
  const [datePart, timePart] = timestamp.split(' ');
  return {
    date: datePart || 'Unknown',
    time: timePart || 'Unknown'
  };
};

export async function GET() {
  try {
    // Validate environment first
    validateEnv();
    
    const auth = getAuth();
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID!, auth);
    
    await doc.loadInfo().catch(error => {
      console.error('Failed to load document info:', error);
      throw new Error('Could not access Google Sheet');
    });

    if (doc.sheetsByIndex.length === 0) {
      throw new Error('No sheets found in the document');
    }

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows().catch(error => {
      console.error('Failed to get rows:', error);
      throw new Error('Could not read sheet data');
    });

    if (!rows || rows.length === 0) {
      return Response.json([], {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    const data = rows.map(row => {
      try {
        const timestamp = row.get('Date()') || row.get('Date') || row.get('date') || '';
        const { date, time } = splitDateTime(timestamp);

        return {
          date,
          time,
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
      } catch (rowError) {
        console.error('Error processing row:', rowError);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed row processing

    return Response.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Return empty array instead of error to prevent client-side crashes
    return Response.json([], {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}