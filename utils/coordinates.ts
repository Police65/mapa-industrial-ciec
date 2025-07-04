// Utility functions for coordinate conversion

export interface DMSCoordinates {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

/**
 * Converts DMS (Degrees, Minutes, Seconds) format to decimal degrees
 * Example: "10°09'52.8\"N" -> 10.164666666666667
 */
export function dmsToDecimal(dmsString: string): number | null {
  try {
    // Remove extra spaces and normalize
    const cleanString = dmsString.trim().replace(/\s+/g, '');
    
    // Match pattern like "10°09'52.8\"N" or "67°57'49.9\"W"
    const regex = /^(\d+)°(\d+)'([\d.]+)"([NSEW])$/i;
    const match = cleanString.match(regex);
    
    if (!match) {
      return null;
    }
    
    const degrees = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseFloat(match[3]);
    const direction = match[4].toUpperCase() as 'N' | 'S' | 'E' | 'W';
    
    // Calculate decimal degrees
    let decimal = degrees + (minutes / 60) + (seconds / 3600);
    
    // Apply direction sign
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }
    
    return decimal;
  } catch (error) {
    console.error('Error converting DMS to decimal:', error);
    return null;
  }
}

/**
 * Converts decimal degrees to DMS format
 * Example: 10.164666666666667 -> "10°09'52.8\"N"
 */
export function decimalToDMS(decimal: number, isLatitude: boolean): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  const direction = isLatitude 
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  
  return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.toFixed(1)}"${direction}`;
}

/**
 * Validates DMS coordinate format
 */
export function isValidDMSFormat(dmsString: string): boolean {
  const cleanString = dmsString.trim().replace(/\s+/g, '');
  const regex = /^(\d+)°(\d+)'([\d.]+)"([NSEW])$/i;
  return regex.test(cleanString);
}

/**
 * Parses a full coordinate string like "10°09'52.8\"N 67°57'49.9\"W"
 */
export function parseCoordinateString(coordinateString: string): { latitude: number | null; longitude: number | null } {
  const parts = coordinateString.trim().split(/\s+/);
  
  if (parts.length !== 2) {
    return { latitude: null, longitude: null };
  }
  
  const latitude = dmsToDecimal(parts[0]);
  const longitude = dmsToDecimal(parts[1]);
  
  return { latitude, longitude };
} 