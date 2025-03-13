import { useEffect, useState } from "react";
import AutoComplete from "./AutoComplete";
import { RadarAddress } from "radar-sdk-js/dist/types";
interface SearchBarProps {
  onChange: (option: RadarAddress | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onChange }) => {
  const [recentSearches, setRecentSearches] = useState<RadarAddress[]>([]);
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    const recentSearches = localStorage.getItem("recentSearches");
    if (recentSearches) {
      setRecentSearches(JSON.parse(recentSearches));
    }
  }, []);

  const handleSelectRecent = (search: RadarAddress) => {
    handleRecentSearch(search);
    setInputValue(search.formattedAddress || "");
    onChange(search);
  };

  const handleSelectAutoComplete = (address: RadarAddress | null) => {
    if (address) {
      onChange(address);
      handleRecentSearch(address);
    } else {
      onChange(null);
    }
  };

  const handleRecentSearch = (search: RadarAddress) => {
    if (!recentSearches.length || search.formattedAddress !== recentSearches[0].formattedAddress) {
      const newRecentSearches = [search, ...recentSearches];
      if (newRecentSearches.length > 5) {
        newRecentSearches.pop();
      }
      setRecentSearches(newRecentSearches);
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    }
  };
  return (
    <div className="block lg:flex items-center gap-4 w-full px-4 relative">
      <AutoComplete onSelect={handleSelectAutoComplete} inputValue={inputValue} setInputValue={setInputValue} />
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 py-3 px-2 w-full overflow-hidden">
          <div className="text-title-2 text-neutral-400">Recent</div>
          <div className="flex flex-1 gap-2 overflow-hidden relative">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleSelectRecent(search)}
                className="text-body-2 text-neutral-500 bg-neutral-100 rounded-full px-3 py-1 whitespace-nowrap cursor-pointer hover:bg-neutral-200 transition-colors duration-200"
              >
                {search.formattedAddress}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="lg:block hidden absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-white " />
    </div>
  );
};

export default SearchBar;
