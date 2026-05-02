import { miniDevider, parseAndCeil, showDistance, useRTL } from "@/utils/Helper";
import React, { useState, useEffect } from "react";
import { BsBookmarkCheckFill, BsBookmarkPlus } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import { useTranslation } from "../Layout/TranslationContext";
import { useSelector } from "react-redux";
import { bookmark } from "@/api/apiRoutes";
import { toast } from "sonner";
import { useIsLogin } from "@/utils/Helper";
import CustomLink from "../ReUseableComponents/CustomLink";
import { useDispatch } from "react-redux";
import { openLoginModal } from "@/redux/reducers/helperSlice";

const TopRatedProviderCard = ({ provider }) => {
  const t = useTranslation();
  const isRTL = useRTL();
  const dispatch = useDispatch();
  const isLoggedIn = useIsLogin(); // Reactive hook - automatically updates when login state changes
  const locationData = useSelector((state) => state?.location);
  const [isBookMarked, setIsBookMarked] = useState(false);

  const handleAddBookMark = async () => {
    if (isLoggedIn) {
      try {
        const res = await bookmark({
          type: "add",
          lat: locationData?.lat,
          lng: locationData?.lng,
          partner_id: provider?.id,
        });
        if (res?.error === false) {
          setIsBookMarked(true);

          toast.success(res?.message);
        } else {
          toast.error(res?.message);
          setIsBookMarked(false);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      dispatch(openLoginModal());
    }
  };

  const handleRemoveBookMark = async () => {
    if (isLoggedIn) {
      try {
        const res = await bookmark({
          type: "remove",
          lat: locationData?.lat,
          lng: locationData?.lng,
          partner_id: provider?.id,
        });
        if (res?.error === false) {
          setIsBookMarked(false);

          toast.success(res?.message);
        } else {
          toast.error(res?.message);
          setIsBookMarked(true);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      dispatch(openLoginModal());
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      setIsBookMarked(provider?.is_bookmarked == "1"); // Compare as string or number
    }
  }, [isLoggedIn, provider?.is_bookmarked]);

  const translatedCompanyName = provider?.translated_company_name ? provider?.translated_company_name : provider?.company_name;

  return (
    <div className="card_bg rounded-2xl overflow-hidden border group ">
      <div className="relative">
        <CustomImageTag
          className="w-full h-auto aspect-provider-banner object-cover"
          src={provider?.banner_image}
          alt={`${translatedCompanyName} cover`}
          imgClassName="object-cover"
        />
        {provider?.discount > 0 && (
          <div className="absolute top-3 left-3 card_bg text-green-500 text-xs font-semibold px-2 py-1 rounded-[8px]">
            {provider?.discount}% {t("off")}
          </div>
        )}
        {provider?.is_ensured === "1" && (
          <div className="absolute z-20 right-3 top-3 flex items-center gap-1 bg-[#F5FAFF] py-1 px-2 rounded-full">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-[10px] w-[10px]"
            >
              <path
                d="M50 4.99901V44.9911C50 46.3169 49.4733 47.5885 48.5358 48.526C47.5982 49.4635 46.3266 49.9901 45.0008 49.9901H28.0034C27.2079 49.9901 26.4449 49.6741 25.8824 49.1116C25.3199 48.5491 25.0039 47.7862 25.0039 46.9907C25.0039 46.1952 25.3199 45.4323 25.8824 44.8698C26.4449 44.3073 27.2079 43.9913 28.0034 43.9913H44.0009V5.99882H6.00678V27.9945C6.00678 28.79 5.69076 29.5529 5.12823 30.1154C4.56571 30.6779 3.80277 30.9939 3.00724 30.9939C2.21171 30.9939 1.44877 30.6779 0.886247 30.1154C0.323725 29.5529 0.00770259 28.79 0.00770259 27.9945V4.99901C0.00770259 3.67319 0.534406 2.40167 1.47194 1.46418C2.40948 0.52668 3.68105 0 5.00693 0H45.0008C46.3266 0 47.5982 0.52668 48.5358 1.46418C49.4733 2.40167 50 3.67319 50 4.99901ZM25.1263 30.8714C24.8477 30.5918 24.5165 30.3699 24.1519 30.2185C23.7873 30.0671 23.3964 29.9892 23.0017 29.9892C22.6069 29.9892 22.216 30.0671 21.8514 30.2185C21.4868 30.3699 21.1557 30.5918 20.877 30.8714L9.00632 42.7416L5.12941 38.8698C4.8504 38.5908 4.51916 38.3695 4.15461 38.2185C3.79005 38.0675 3.39933 37.9898 3.00474 37.9898C2.61015 37.9898 2.21943 38.0675 1.85488 38.2185C1.49032 38.3695 1.15908 38.5908 0.880068 38.8698C0.601052 39.1488 0.379725 39.4801 0.228722 39.8446C0.0777198 40.2091 -5.87982e-09 40.5998 0 40.9944C5.87982e-09 41.389 0.0777198 41.7797 0.228722 42.1442C0.379725 42.5088 0.601052 42.84 0.880068 43.119L6.87914 49.1178C7.15781 49.3974 7.48894 49.6193 7.85354 49.7707C8.21814 49.9221 8.60904 50 9.00382 50C9.3986 50 9.78949 49.9221 10.1541 49.7707C10.5187 49.6193 10.8498 49.3974 11.1285 49.1178L25.1263 35.1206C25.406 34.8419 25.6278 34.5108 25.7792 34.1462C25.9306 33.7816 26.0086 33.3908 26.0086 32.996C26.0086 32.6012 25.9306 32.2103 25.7792 31.8458C25.6278 31.4812 25.406 31.1501 25.1263 30.8714Z"
                fill="#0EA02E"
              />
            </svg>
            <span className="font-semibold text-[#0EA02E] text-xs">
              {t("Insured")}
            </span>
          </div>
        )}
        <div className="absolute z-50 top-3 -right-10 card_bg text-black dark:text-white text-xs font-semibold px-2 py-1 rounded-[8px] transition-all duration-300 group-hover:right-3">
          {isBookMarked ? (
            <BsBookmarkCheckFill
              size={22}
              onClick={handleRemoveBookMark}
              className="cursor-pointer primary_text_color"
            />
          ) : (
            <BsBookmarkPlus
              size={22}
              onClick={handleAddBookMark}
              className="cursor-pointer transition-all duration-300 group-hover:right-3"
            />
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <CustomImageTag
            className={`w-12 aspect-square ${isRTL ? "mr-0 ml-3" : "ml-0 mr-3"
              }`}
            src={provider?.image}
            alt={`${translatedCompanyName} logo`}
            imgClassName="rounded-xl"
          />
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-semibold text-lg leading-tight line-clamp-1">
                {translatedCompanyName}
              </h2>
              {provider?.is_verified === "1" && (
                <span className="primary_text_color flex-shrink-0">
                  <RiVerifiedBadgeFill size={20} />
                </span>
              )}
            </div>
            {provider?.total_services > 0 && (
              <span className="text-sm primary_text_color font-medium">
                {provider?.total_services} {provider?.total_services > 1 ? t("services") : t("service")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Rating */}
          {provider.ratings > 0 && (
            <>
              <div className="flex items-center">
                <FaStar className="rating_icon_color mr-1" />
                <span className="font-semibold">
                  {provider.ratings}
                </span>
              </div>

              {/* Vertical Divider */}
              {miniDevider}
            </>
          )}

          {/* Distance */}
          <div className="flex items-center">
            <FaMapMarkerAlt className="primary_text_color mr-1" />
            <span className="font-semibold">
              {" "}
              {showDistance(provider?.distance)}
            </span>
          </div>
        </div>
        <button className="w-full light_bg_color primary_text_color dark:text-white font-normal py-2.5 px-4 rounded-lg text-sm mt-4">
          <CustomLink href={`/provider-details/${provider?.slug}`}>
            {t("viewService")}
          </CustomLink>
        </button>
      </div>
    </div>
  );
};

export default TopRatedProviderCard;
