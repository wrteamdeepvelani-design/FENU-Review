"use client";
import React, { useEffect } from "react";
import { RiUserSettingsLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useTranslation } from "./TranslationContext";
import { useRouter } from "next/router";
import CustomLink from "../ReUseableComponents/CustomLink";

const TopHeader = () => {
  const t = useTranslation();
  const router = useRouter();
  const webSettings = useSelector(
    (state) => state?.settingsData?.settings?.web_settings
  );

  const isBecomeProviderPage = router.pathname === "/become-provider";

  useEffect(() => {
    if (
      isBecomeProviderPage &&
      webSettings?.show_become_provider_page === false
    ) {
      router.push("/");
    }
  }, [isBecomeProviderPage, webSettings, router]);

  return (
    <div className="hidden lg:block primary_bg_color text-white py-2 px-2 md:px-4 top-header">
      <div className="container mx-auto">
        <div className="flex gap-4 md:gap-1 justify-between w-full items-center md:space-y-0">
          <div className="hidden md:flex items-center justify-center gap-2">
            {webSettings?.show_become_provider_page && (
              <>
                <span>
                  <RiUserSettingsLine size={20} />
                </span>
                <CustomLink
                  href="/become-provider"
                  className="underline font-normal text-sm md:text-base"
                  title="become-provider"
                >
                  {t("becomeProvider")}
                </CustomLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
