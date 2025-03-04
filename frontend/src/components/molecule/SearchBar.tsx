import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
interface SearchBarProps {
  onChange: (option: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onChange }) => {
  const [searchKey, setSearchKey] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  useEffect(() => {
    const recentSearches = localStorage.getItem("recentSearches");
    if (recentSearches) {
      setRecentSearches(JSON.parse(recentSearches));
    }
  }, []);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onChange(searchKey);
      handleRecentSearch(searchKey);
    }
  };
  const handleSelectRecent = (search: string) => {
    setSearchKey(search);
    onChange(search);
    handleRecentSearch(search);
  };
  const handleRecentSearch = (search: string) => {
    if (search != recentSearches[0]) {
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
      <div className={cn("relative w-full lg:w-[640px]")}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={20} className="text-blue-500" />
        </div>
        <Input
          type="text"
          placeholder="Search car washes location"
          className="rounded-full text-sm py-3.5 border-[#189DEF80] border-2 pl-10"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyDown={handleEnter}
        />
      </div>
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 py-3 px-2">
          <div className="text-title-2 text-neutral-400">Recent</div>
          <div className="flex flex-1 gap-2 overflow-hidden relative">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleSelectRecent(search)}
                className="text-body-2 text-neutral-500 bg-neutral-100 rounded-full px-3 py-1 whitespace-nowrap cursor-pointer hover:bg-neutral-200 transition-colors duration-200"
              >
                {search}
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
