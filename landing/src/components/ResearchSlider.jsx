import React, { useEffect, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
const SplideCarousel = () => {
  const researchHighlights = [
    {
      title: "Retail Dive Survey (2018)",
      description: `<span class="text-[#189DEF] font-bold text-lg">67% </span>  of consumers prefer checking prices online before shopping in-store`,
    },
    {
      title: "Google Consumer Insights",
      description:
        'Over <span class="text-[#189DEF] font-bold text-lg">80% </span>  of smartphone users compare prices online before making a purchase decision, whether in-store or online.',
    },
    {
      title: "Think With Google Study (2021)",
      description:
        '<span class="text-[#189DEF] font-bold text-lg">59% </span>  of shoppers said they find it very important to have access to pricing information when researching local businesses.',
    },
    {
      title: "Pew Research Center Study (2021)",
      description:
        'About <span class="text-[#189DEF] font-bold text-lg">82% </span>  of adults report reading online customer ratings and reviews before making a purchase decision.',
    },
    {
      title: "PowerReviews Research (2022)",
      description:
        ' <span class="text-[#189DEF] font-bold text-lg">95% </span>  of shoppers say they rely on reviews when evaluating products or services.  <span class="text-[#189DEF] font-bold text-lg">86% </span> say they specifically avoid businesses with low ratings or negative reviews.',
    },
    {
      title: "BrightLocal Consumer Review Survey (2023)",
      description:
        '<span class="text-[#189DEF] font-bold text-lg">93% </span>  of consumers say online reviews impact their purchasing decisions.<span class="text-[#189DEF] font-bold text-lg">49% </span> say they trust reviews as much as personal recommendations.',
    },
  ];
  const [isMobileView, setISMobileView] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setISMobileView(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      {!isMobileView && (
        <div className="splide-container">
          <Splide
            options={{
              type: "loop",
              perPage: 3,
              gap: "1rem",
              pagination: false,
              height: "260px",
              arrows: false,
              autoplay: true,
              speed: 1000,
              interval: 4000,
              focus: "center",
              pauseOnHover: false,
            }}
          >
            {researchHighlights.map((highlight, index) => (
              <SplideSlide key={index}>
                <div className="h-[240px]  max-lg:h-auto flex flex-col items-center justify-center gap-4 bg-[#E2F3FD] rounded-3xl p-12 max-lg:p-6 max-lg:gap-2">
                  <h3 className="text-[24px] font-bold leading-[30px] text-[#27292C] max-lg:mx-0 max-lg:text-[18px] text-wrap text-center">
                    {highlight.title}
                  </h3>
                  <p
                    className="font-normal text-[16px] text-center max-lg:text-[16px] text-[#41454B] text-wrap"
                    dangerouslySetInnerHTML={{ __html: highlight.description }}
                  ></p>
                </div>
              </SplideSlide>
            ))}
          </Splide>
        </div>
      )}
      {isMobileView &&
        researchHighlights.map((highlight, index) => (
          <div key={index}>
            <div className=" h-[212px] max-lg:h-auto flex flex-col items-center justify-center gap-4 bg-[#E2F3FD] rounded-3xl p-12 max-lg:p-6 max-lg:gap-2 mb-2.5">
              <h3 className="text-[24px] font-bold leading-[30px] text-[#27292C] max-lg:mx-0 max-lg:text-[18px] text-wrap text-center">
                {highlight.title}
              </h3>
              <p
                className="font-normal text-[16px] text-center max-lg:text-[16px] text-[#41454B] text-wrap"
                dangerouslySetInnerHTML={{ __html: highlight.description }}
              ></p>
            </div>
          </div>
        ))}
    </>
  );
};

export default SplideCarousel;
