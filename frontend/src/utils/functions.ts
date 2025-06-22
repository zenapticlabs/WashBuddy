export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export function extractCoordinates(locationString: string): { lat: number; lng: number } {
  // Format: "SRID=4326;POINT (-88.154784 42.0090209)"
  const matches = locationString.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
  if (!matches) {
    return { lat: 0, lng: 0 };
  }
  return {
    lat: parseFloat(matches[2]), // latitude is second number
    lng: parseFloat(matches[1]), // longitude is first number
  };
}

export const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'string') return value.trim() === '';
    return false;
};

export const areArraysDifferent = (arr1: any[] | null | undefined, arr2: any[] | null | undefined): boolean => {
    if (isEmpty(arr1) && isEmpty(arr2)) return false;
    if (isEmpty(arr1) || isEmpty(arr2)) return true;
    if (arr1!.length !== arr2!.length) return true;
    const set1 = new Set(arr1);
    return arr2!.some(item => !set1.has(item));
};

export const generatePatchData = (
    currentData: Record<string, any>,
    originalData: Record<string, any>,
    alwaysInclude: Record<string, any> = {}
): Record<string, any> => {
    const patchData: Record<string, any> = { ...alwaysInclude };

    Object.keys(currentData).forEach(key => {
        const originalValue = originalData[key];
        const currentValue = currentData[key];

        if (isEmpty(originalValue) && isEmpty(currentValue)) return;

        if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
            if (areArraysDifferent(originalValue, currentValue)) {
                patchData[key] = currentValue;
            }
            return;
        }

        if (typeof originalValue === 'object' && typeof currentValue === 'object') {
            if (isEmpty(originalValue) && isEmpty(currentValue)) return;
            if ((isEmpty(originalValue) !== isEmpty(currentValue)) || 
                JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
                patchData[key] = currentValue;
            }
            return;
        }

        if (!isEmpty(currentValue) || !isEmpty(originalValue)) {
            if (originalValue !== currentValue) {
                patchData[key] = currentValue;
            }
        }
    });

    return patchData;
};
