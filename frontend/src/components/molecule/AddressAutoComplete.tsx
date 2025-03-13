import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadarAddress } from 'radar-sdk-js/dist/types';

// Add interface for Radar API response

interface AutoCompleteProps {
    onSelect: (address: RadarAddress | null) => void;  // Modified to pass full address object
}

const AddressAutoComplete: React.FC<AutoCompleteProps> = ({ onSelect }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<RadarAddress[]>([]);
    // Add debouncing to prevent too many API calls
    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Fetch suggestions from Radar API
    const fetchSuggestions = async (query: string) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `${process.env.NEXT_PUBLIC_RADAR_API_KEY}`
                    }
                }
            );
            const data = await response.json();
            setSuggestions(data.addresses || []);
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
            setSuggestions([]);
        }
    };

    const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            setInputValue(value);
            debouncedFetchSuggestions(value);
        } else {
            onSelect(null);
            setInputValue("");
            setSuggestions([]);
        }
    };


    const handleSelectAddress = (address: RadarAddress) => {
        onSelect(address);
        setInputValue(address.formattedAddress || "");
        setSuggestions([]);
    };


    return (
        <div ref={wrapperRef} className="relative">
            <div className={cn("relative w-full")}>
                <Input
                    type="text"
                    placeholder="Search car washes location"
                    className="py-3.5 w-full"
                    value={inputValue}
                    onChange={handleInputChange}
                />
            </div>
            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelectAddress(suggestion)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {suggestion.formattedAddress}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddressAutoComplete;
