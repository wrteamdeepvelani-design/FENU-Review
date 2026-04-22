import React from "react";
import { useTranslation } from "../Layout/TranslationContext";
import CustomLink from "./CustomLink";

const CommanHeadline = ({ headline, subHeadline, link }) => {
  const t = useTranslation();

  return (
    <div className="flex items-center md:items-end justify-between w-full pb-[32px]">
      <div className="flex flex-col items-start justify-start gap-2">
        <span className="text-lg md:text-3xl font-semibold">{headline}</span>
        <span className="primary_text_color text-sm md:text-base font-normal">
          {subHeadline}
        </span>
      </div>
      {link &&
      <div className="primary_bg_color rounded-md transition-colors duration-500 text-white px-6 py-2">
        <CustomLink
          href={link}
          className="text-nowrap text-sm md:text-base text-center font-normal md:text-end"
          title={t("viewAll")}
          >
          {t("viewAll")} {link.replace("/", "").charAt(0).toUpperCase() + link.replace("/", "").slice(1)}
        </CustomLink>
      </div>
        }
    </div>
  );
};

export default CommanHeadline;
