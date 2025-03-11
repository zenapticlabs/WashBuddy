import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Add interface for Radar API response
interface RadarAddress {
    formattedAddress: string;
    latitude: number;
    longitude: number;
}

interface AutoCompleteProps {
    onSelect: (address: RadarAddress | null) => void;  // Modified to pass full address object
    inputValue: string;
    setInputValue: (value: string) => void;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({ onSelect, inputValue, setInputValue }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
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
        setInputValue(address.formattedAddress);
        setSuggestions([]);
    };


    return (
        <div ref={wrapperRef} className="relative">
            <div className={cn("relative w-full lg:w-[640px]")}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search size={20} className="text-blue-500" />
                </div>
                <Input
                    type="text"
                    placeholder="Search car washes location"
                    className="rounded-full text-sm py-3.5 border-[#189DEF80] border-2 pl-10 w-full"
                    value={inputValue}
                    onChange={handleInputChange}
                />
            </div>
            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full lg:w-[640px] mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
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

export default AutoComplete;
