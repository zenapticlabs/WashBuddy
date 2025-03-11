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
