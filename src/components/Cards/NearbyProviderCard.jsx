"use client";
import { miniDevider, showDistance, useRTL } from "@/utils/Helper";
import { BsBookmarkCheckFill } from "react-icons/bs";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa6";
import { useTranslation } from "../Layout/TranslationContext";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import { RiVerifiedBadgeFill } from "react-icons/ri";

const NearbyProviderCard = ({ provider, isBookmark, handleRemoveBookMark }) => {
  const t = useTranslation();
  const isRTL = useRTL();
  return (
    <div className="w-full flex flex-col border rounded-2xl p-4 max-w-md sm:max-w-full mx-auto custom-shadow card_bg hover:border_color transition-all duration-300 group">
      {/* Top Section: Provider Image and Details */}
      <div className="flex items-center mb-2 gap-4">
        {/* Provider Image */}
        <div className="flex-shrink-0 border rounded-xl light_bg_color">
          <CustomImageTag
            src={provider?.image} // Using provider's image URL
            alt={provider?.company_name}
            className="rounded-xl w-16 h-auto aspect-square sm:w-20"
            imgClassName="rounded-xl object-cover"
          />
        </div>

        {/* Provider Details */}
        <div className="flex-grow h-full">
          <div className="relative flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base xl:text-xl line-clamp-1">
                {provider?.translated_company_name
                  ? provider?.translated_company_name
                  : provider?.company_name}
              </h2>
              {provider?.is_verified === "1" && (
                <span className="text-xl primary_text_color">
                  <RiVerifiedBadgeFill size={20} />{" "}
                </span>
              )}
              {provider?.is_ensured === "1" && (
                <div className="absolute z-20 right-[0px] top-[-20px] flex items-center gap-1 ">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[15px] w-[15px] "
                  >
                    <path
                      d="M50 4.99901V44.9911C50 46.3169 49.4733 47.5885 48.5358 48.526C47.5982 49.4635 46.3266 49.9901 45.0008 49.9901H28.0034C27.2079 49.9901 26.4449 49.6741 25.8824 49.1116C25.3199 48.5491 25.0039 47.7862 25.0039 46.9907C25.0039 46.1952 25.3199 45.4323 25.8824 44.8698C26.4449 44.3073 27.2079 43.9913 28.0034 43.9913H44.0009V5.99882H6.00678V27.9945C6.00678 28.79 5.69076 29.5529 5.12823 30.1154C4.56571 30.6779 3.80277 30.9939 3.00724 30.9939C2.21171 30.9939 1.44877 30.6779 0.886247 30.1154C0.323725 29.5529 0.00770259 28.79 0.00770259 27.9945V4.99901C0.00770259 3.67319 0.534406 2.40167 1.47194 1.46418C2.40948 0.52668 3.68105 0 5.00693 0H45.0008C46.3266 0 47.5982 0.52668 48.5358 1.46418C49.4733 2.40167 50 3.67319 50 4.99901ZM25.1263 30.8714C24.8477 30.5918 24.5165 30.3699 24.1519 30.2185C23.7873 30.0671 23.3964 29.9892 23.0017 29.9892C22.6069 29.9892 22.216 30.0671 21.8514 30.2185C21.4868 30.3699 21.1557 30.5918 20.877 30.8714L9.00632 42.7416L5.12941 38.8698C4.8504 38.5908 4.51916 38.3695 4.15461 38.2185C3.79005 38.0675 3.39933 37.9898 3.00474 37.9898C2.61015 37.9898 2.21943 38.0675 1.85488 38.2185C1.49032 38.3695 1.15908 38.5908 0.880068 38.8698C0.601052 39.1488 0.379725 39.4801 0.228722 39.8446C0.0777198 40.2091 -5.87982e-09 40.5998 0 40.9944C5.87982e-09 41.389 0.0777198 41.7797 0.228722 42.1442C0.379725 42.5088 0.601052 42.84 0.880068 43.119L6.87914 49.1178C7.15781 49.3974 7.48894 49.6193 7.85354 49.7707C8.21814 49.9221 8.60904 50 9.00382 50C9.3986 50 9.78949 49.9221 10.1541 49.7707C10.5187 49.6193 10.8498 49.3974 11.1285 49.1178L25.1263 35.1206C25.406 34.8419 25.6278 34.5108 25.7792 34.1462C25.9306 33.7816 26.0086 33.3908 26.0086 32.996C26.0086 32.6012 25.9306 32.2103 25.7792 31.8458C25.6278 31.4812 25.406 31.1501 25.1263 30.8714Z"
                      fill="#0EA02E"
                    />
                  </svg>
                  <span className=" font-semibold text-[#0EA02E] flex justify-center items-center">
                    {t("Insured")}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm description_color">{provider?.description}</p>
          </div>

          {/* Services and Discount */}
          <div className="flex flex-wrap md:flex-nowrap gap-4 items-center text-sm mt-2">
            {provider?.total_services > 0 && (
              <>
                <span className="primary_text_color group-hover:underline">
                  {provider?.total_services.toString().padStart(2)}{" "}
                  {provider?.total_services > 1 ? t("services") : t("service")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-2" />

      {/* Bottom Section: Rating, Distance, and Arrow */}
      <div className="flex items-center justify-between text-sm sm:text-base">
        {/* Rating and Distance Grouped */}
        <div className="flex items-center gap-4">
          {/* Rating */}
          {provider?.ratings > 0 && (
            <div className="flex items-center">
              <FaStar className="rating_icon_color mr-1" size={18} />
              <span className="font-semibold">
                {Number(provider?.ratings).toFixed(1)}
              </span>
            </div>
          )}

          {/* Show miniDevider only if both ratings and distance exist */}
          {(provider?.ratings > 0 || provider?.ratings > 0) &&
          provider?.distance !== ""
            ? miniDevider
            : null}

          {/* Distance */}
          {provider?.distance !== "" && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="primary_text_color mr-1" />
              <span className="font-semibold capitalize">
                {showDistance(provider?.distance)}
              </span>
            </div>
          )}
        </div>
        {isBookmark ? (
          <div
            className="primary_text_color"
            onClick={(e) => handleRemoveBookMark(e, provider)}
          >
            <BsBookmarkCheckFill size={22} />
          </div>
        ) : (
          <div className="flex items-center gap-1 relative">
            <div className="flex items-center gap-1">
              {/* Show hover effect only on large screens */}
              <span
                className={`text-base font-normal primary_text_color underline transform transition-transform duration-500 opacity-0 ${
                  isRTL ? "-translate-x-2" : "translate-x-2"
                } hidden xl:inline group-hover:opacity-100 group-hover:translate-x-0`}
              >
                {t("viewMore")}
              </span>
              {/* Always visible icon */}
              <FaAngleRight
                size={16}
                className={`group-hover:primary_text_color hidden xl:inline ${
                  isRTL ? "rotate-180" : "rotate-0"
                }`}
              />
              <FaAngleRight
                size={16}
                className={`primary_text_color xl:hidden ${
                  isRTL ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyProviderCard;
