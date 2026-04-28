import React from "react";
import { useTranslation } from "../Layout/TranslationContext";
import CustomLink from "./CustomLink";
import CustomImageTag from "./CustomImageTag";

const CommanHeadline = ({ headline, subHeadline, link, image }) => {
  const t = useTranslation();

  const hasImage = typeof image === "string" && image.trim().length > 0;

  return (
    <div className="flex items-center md:items-end justify-between w-full pb-[32px]">
      <div className="flex items-start justify-start gap-2 px-[3px] py-[5px] ">
        {hasImage && (
          <div
            className={`w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex-shrink-0 rounded-[3px] bg-[#0E49A0] duration-300 flex items-center justify-center p-2`}
            // style={{ backgroundColor: imageBgColor }}
          >
            <CustomImageTag
              src={image}
              alt={"logo"}
              className="w-full h-full"
              imgClassName=""
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-base md:text-3xl font-semibold ">
            {headline}
          </span>
          <span className="primary_text_color text-sm md:text-base font-normal">
            {subHeadline}
          </span>
        </div>
      </div>
      {link && (
        <div className="primary_bg_color rounded-md transition-colors duration-500 text-white px-6 py-2">
          <CustomLink
            href={link}
            className="text-nowrap text-sm md:text-base text-center font-normal md:text-end"
            title={t("viewAll")}
          >
            {t("viewAll")}{" "}
            {link.replace("/", "").charAt(0).toUpperCase() +
              link.replace("/", "").slice(1)}
          </CustomLink>
        </div>
      )}
    </div>
  );
};

export default CommanHeadline;
