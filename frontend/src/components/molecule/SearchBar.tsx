import { useEffect, useState, useRef } from "react";
import AutoComplete from "./AutoComplete";
import { RadarAddress } from "radar-sdk-js/dist/types";

interface SearchBarProps {
  onChange: (option: RadarAddress | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onChange }) => {
  const [recentSearches, setRecentSearches] = useState<RadarAddress[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="block lg:flex items-center gap-4 w-full px-4 relative">
      <AutoComplete onSelect={handleSelectAutoComplete} inputValue={inputValue} setInputValue={setInputValue} />
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 pt-3 lg:pt-0 px-2 w-full overflow-hidden">
          <div className="text-title-2 text-neutral-400">Recent</div>
          <div 
            ref={containerRef}
            className="flex flex-1 gap-2 overflow-x-auto relative cursor-grab active:cursor-grabbing scrollbar-hide"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',  /* IE and Edge */
              scrollbarWidth: 'none',    /* Firefox */
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;  /* Chrome, Safari and Opera */
              }
            `}</style>
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleSelectRecent(search)}
                className="text-body-2 text-neutral-500 bg-neutral-100 rounded-full px-3 py-1 whitespace-nowrap cursor-pointer hover:bg-neutral-200 transition-colors duration-200 select-none"
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
