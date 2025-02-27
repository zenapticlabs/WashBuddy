import React, { useEffect, useState } from "react";

function AutoCompleteSearch() {
  const [query, setQuery] = useState("");
  const [isShow, setShow] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const radarApiKey = "prj_test_pk_ed120b27792e078a953e6e7ecb7c51e8800fd503";
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    rencentSeachesSetter();
  }, []);

  const rencentSeachesSetter = () => {
    const searches = JSON.parse(localStorage.getItem("recentSearches"));
    setRecentSearches(searches?.length ? searches : []);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      if (value.length >= 2) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShow(false);
      }
    }, 100);

    setDebounceTimeout(timeout);
  };

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://api.radar.io/v1/search/autocomplete?query=${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `${radarApiKey}`,
          },
        }
      );

      const data = await response.json();
      setShow(true);

      if (data?.addresses?.length) {
        setSuggestions(data.addresses);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions from Radar:", error);
    }
  };

  const detectLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://api.radar.io/v1/geocode/reverse?coordinates=${latitude},${longitude}`,
            {
              method: "GET",
              headers: {
                Authorization: `${radarApiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();
          const address = data.addresses[0] || {};
          const reverseGeoCodeString = [
            address?.addressLabel,
            address?.city,
            address?.state,
            address?.stateCode,
            address?.countryCode,
          ]
            .filter(Boolean)
            .join(" ");
          setQuery(reverseGeoCodeString);
          fetchSuggestions(reverseGeoCodeString);
        } catch (error) {
          console.error("Error sending data to Radar API:", error);
        }
      },
      (error) => {
        console.log("Error getting location: " + error.message);
      }
    );
  };

  const handleSuggestionClick = (suggestion) => {
    const placeNameString = [
      suggestion?.addressLabel,
      suggestion?.street,
      suggestion?.locality,
      suggestion?.stateCode,
    ]
      .filter(Boolean)
      .join(" ");
    setQuery(placeNameString);
    setSelectedLocation(suggestion);
    setSuggestions([]);
    setShow(false);
  };

  const handleSearchButton = () => {
    let recentSearches = localStorage.getItem("recentSearches") || "[]";
    if (selectedLocation.addressLabel && recentSearches) {
      const recentSearchesArray = JSON.parse(recentSearches);
      if (recentSearchesArray.length >= 5) {
        recentSearchesArray.shift();
        recentSearchesArray.push(selectedLocation);
        localStorage.setItem(
          "recentSearches",
          JSON.stringify(recentSearchesArray)
        );
      } else {
        recentSearchesArray.push(selectedLocation);
        localStorage.setItem(
          "recentSearches",
          JSON.stringify(recentSearchesArray)
        );
      }
    } else {
      localStorage.setItem(
        "recentSearches",
        JSON.stringify([selectedLocation])
      );
    }
    setQuery("");
    rencentSeachesSetter();
  };

  const onRecentSearchClick = (e) => {
    const selectedAddress = e.target.innerText;
    setQuery(selectedAddress);
  };

  return (
    <div className="w-full md:w-[60vw] h-[139px] max-lg:h-52 md:mt-[-50px] drop-shadow-xl flex flex-col gap-4 bg-white p-[16px] md:p-[24px] rounded-[24px]">
      <div className="flex items-center max-lg:flex-col gap-2">
        <div className="flex items-center gap-[8px] w-full">
          <div className="flex items-center gap-[8px] rounded-[100px] p-[8px] border-2 border-[#189DEF80] w-full h-full relative">
            <input
              type="search"
              placeholder="Search wash prices by city/zip"
              className="w-full border-none focus:border-none focus:outline-none text-neutral-900"
              onChange={handleInputChange}
              value={query}
            />

            {isShow && query && (
              <ul className="w-full border-none flex flex-col z-50 h-auto bg-white shadow-lg rounded-lg mt-2 absolute top-[35px] max-h-[200px] overflow-y-auto">
                {suggestions?.length === 0 ? (
                  <li className="p-2 text-center text-gray-500">
                    No results found
                  </li>
                ) : (
                  suggestions?.map((suggestion, index) => {
                    const displayText = [
                      suggestion?.addressLabel,
                      suggestion?.street,
                      suggestion?.locality,
                      suggestion?.stateCode,
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {displayText}
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
          <a
            href="https://washbuddy-frontend.vercel.app/"
            class="h-[44px] min-w-[44px] w-[44px] border-2 border-[#189DEF80] rounded-full flex items-center justify-center cursor-pointer"
            target="blank"
          >
            <img
              src="/search_icon.svg"
              format="svg"
              alt={""}
              className="w-[16.27px] h-[16.27px] cursor-pointer"
              onClick={() => {
                if (query.length >= 2) {
                  handleSearchButton();
                }
              }}
            />
          </a>
        </div>

        <button
          className="pt-2 pb-2 pl-6 pr-6 gap-1 max-lg:gap-1 border-2 max-lg:w-full border-[#189DEF80] rounded-full flex items-center justify-center cursor-pointer whitespace-nowrap min-h-11"
          onClick={() => {
            detectLocation();
          }}
        >
          <img
            src="/crosshair.svg"
            format="svg"
            alt={""}
            className={"w-[16.27px] h-[16.27px]"}
          />
          <span className="font-semibold text-[14px] leading-[18.9px] text-[#189DEF]">
            Detect Location
          </span>
        </button>
      </div>

      <div className="flex items-center gap-[12px] text-neutral-500 text-[14px] relative after:absolute after:top-0 after:right-0 after:h-full after:w-[35px] after:bg-gradient-to-l after:from-white after:to-transparent after:z-10">
        <span>Recent</span>
        <div className="results-hidden overflow-auto">
          <div className="flex items-center gap-[8px] whitespace-nowrap">
            {recentSearches?.length !== 0 &&
              recentSearches?.map((address, index) => {
                return (
                  <button
                    className="bg-neutral-50 rounded-[1000px] p-[10px] cursor-pointer opacity-80 hover:opacity-200"
                    key={index}
                    onClick={onRecentSearchClick}
                  >
                    {[
                      address?.addressLabel,
                      address?.street,
                      address?.locality,
                      address?.state,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoCompleteSearch;
