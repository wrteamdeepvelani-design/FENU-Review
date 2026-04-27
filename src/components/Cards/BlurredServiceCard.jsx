"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useRTL } from "@/utils/Helper";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import { useTranslation } from "../Layout/TranslationContext";
import { useSelector } from "react-redux";

const BlurredServiceCard = ({ elem, handleRouteChange }) => {
  const t = useTranslation();
  const isRTL = useRTL();
  const currency = useSelector(
    (state) =>
      state.settingsData?.settings?.general_settings?.currency ||
      state.settingsData?.settings?.app_settings?.currency ||
      "",
  );

  const translatedName = elem?.translated_name
    ? elem?.translated_name
    : elem?.name;

  return (
    <div
      className="relative w-full subCategory rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => handleRouteChange(elem)}
    >
      <CustomImageTag
        // Use object-cover to avoid image stretch, especially on mobile.
        // We keep full width/height and positioning, but rely on object-fit for proper aspect ratio.
        className="w-full aspect-subCategory absolute inset-0 object-cover object-center transition-transform duration-300"
        src={elem?.category_image || elem?.image}
        alt={`${translatedName}`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(19.52deg,var(--primary-color)_12.79%,transparent_49.31%)]" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2">
            {translatedName}
          </h3>
          {elem?.total_providers === undefined && (
            <ArrowRight
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isRTL ? "rotate-180" : "rotate-0"
              }`}
              size={20}
            />
          )}
        </div>
        {elem?.total_providers !== undefined && (
          <div className="relative mt-1 h-5 overflow-hidden">
            {/* Default Text */}
            <span
              className="absolute inset-0 flex items-center text-sm 
    transition-all duration-300 
    group-hover:-translate-y-full group-hover:opacity-0"
            >
              {t("starting_from")} {elem?.lowest_price} {currency}
            </span>

            {/* Hover Text */}
            <div
              className={`absolute inset-0 flex items-center gap-1.5 
    translate-y-full opacity-0 
    transition-all duration-300 
    group-hover:translate-y-0 group-hover:opacity-100 
    ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="text-sm font-semibold">
                {t("view_details") || "View Details"}
              </span>
              <IoArrowForwardCircleOutline
                className={isRTL ? "rotate-180" : ""}
                size={20}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlurredServiceCard;
