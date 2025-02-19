import { useState, useEffect } from 'react';

interface LocationDetails {
  country?: string;
  state?: string;
  zipCode?: string;
  formattedAddress?: string;
  loading: boolean;
  error: string | null;
}

export const useReverseGeocode = (latitude: number | null, longitude: number | null) => {
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchAddress = async () => {
      setLocationDetails(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(
          `https://api.radar.io/v1/geocode/reverse?coordinates=${latitude},${longitude}`,
          {
            headers: {
              'Authorization': process.env.NEXT_PUBLIC_RADAR_API_KEY || '',
            },
          }
        );
        const data = await response.json();

        if (!data.addresses || data.addresses.length === 0) {
          throw new Error('No address found');
        }

        const address = data.addresses[0];
        setLocationDetails({
          country: address.country,
          state: address.state,
          zipCode: address.postalCode,
          formattedAddress: address.formattedAddress,
          loading: false,
          error: null,
        });
      } catch (error) {
        setLocationDetails({
          loading: false,
          error: 'Failed to fetch address details',
        });
      }
    };

    fetchAddress();
  }, [latitude, longitude]);

  return locationDetails;
};