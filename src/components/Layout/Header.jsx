"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  lazy,
  Suspense,
  useRef,
} from "react";
import { FaBars, FaShoppingCart, FaTimes } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { logoutApi, getLanguageJsonDataApi } from "@/api/apiRoutes";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";
import { clearCart, selectTotalItems } from "@/redux/reducers/cartSlice";
import { clearUserData, getUserData } from "@/redux/reducers/userDataSlice";
import { useIsLogin, useRTL } from "@/utils/Helper";
import { useDispatch, useSelector } from "react-redux";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import EditProfileModal from "../auth/EditProfile";
import TopHeader from "./TopHeader";
import CartDialog from "../ReUseableComponents/Dialogs/CartDialog";
import { usePathname } from "next/navigation";
import AccountDialog from "../ReUseableComponents/Dialogs/AccountDialog";
import LocationModal from "../ReUseableComponents/LocationModal";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { MdWarning } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiMoonClearLine, RiSunLine } from "react-icons/ri";

dayjs.extend(utc);
dayjs.extend(timezone);

import { useTranslation } from "./TranslationContext";
import { selectReorderMode } from "@/redux/reducers/reorderSlice";
import LogoutDialog from "../ReUseableComponents/Dialogs/LogoutDialog";
import FirebaseData from "@/utils/Firebase";
import { useTheme } from "next-themes";
import config from "@/utils/Langconfig";
import { setTheme } from "@/redux/reducers/themeSlice";
import {
  setTranslations,
  setLanguage as setReduxLanguage,
} from "@/redux/reducers/translationSlice";
import { toast } from "sonner";
import RegisterAsProviderModal from "../auth/RegisterAsProviderModal/index";
import CustomLink from "../ReUseableComponents/CustomLink";
import { logClarityEvent } from "@/utils/clarityEvents";
import { AUTH_EVENTS } from "@/constants/clarityEventNames";
import LoginModal from "../auth/LoginModal/LoginModal";
import { getNavigationItems } from "./navigationConfig";
import NavLink from "./NavLink";
import { selectLoginModalOpen, openLoginModal, closeLoginModal } from "@/redux/reducers/helperSlice";
import SetPasswordModal from "../auth/SetPasswordModal";
// Lazy load sidebar content for better performance
const SidebarContent = lazy(() => import("./SidebarContent"));

const Header = () => {
  const t = useTranslation();
  const router = useRouter();
  const isRTL = useRTL();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const { signOut } = FirebaseData();
  const userData = useSelector(getUserData);
  const settingsData = useSelector((state) => state?.settingsData);
  const websettings = settingsData?.settings?.web_settings;
  // Get FCM token from userDataSlice (not settingsData)
  const fcmToken = useSelector((state) => state?.userData?.fcmToken);
  const isLoggedIn = useIsLogin(); // Reactive hook - automatically updates when login state changes
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const isChangingLanguageRef = useRef(null);
  const [showMaintenanceBanner, setShowMaintenanceBanner] = useState(false);
  const [isBannerClosed, setIsBannerClosed] = useState(false);
  const isLoginModalOpen = useSelector(selectLoginModalOpen);
  const [isRegisterAsProviderModalOpen, setRegisterAsProviderModalIsOpen] =
    useState(false);
  const [cartVisibleDeskTop, setCartVisibleDeskTop] = useState(false);
  const [cartVisibleMobile, setCartVisibleMobile] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openSetPasswordModal, setOpenSetPasswordModal] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const isRegisterAsProviderAllow =
    websettings?.register_provider_from_web_setting_status === 1;

  const [dropdownStates, setDropdownStates] = useState({
    account: false,
  });

  const toggleDropdown = (key) => {
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const defaultLang = useSelector((state) => state.translation.defaultLanguage);

  const isCheckoutPage = pathName === "/checkout";
  const isCartPage = pathName === "/cart";
  const isBecomeProviderPage = pathName === "/become-provider";

  // Access total item count using the selector
  const totalItems = useSelector(selectTotalItems);

  const isReorder = useSelector(selectReorderMode);

  /**
   * Navigation Mode Logic:
   * - WITHOUT location (no lat/long): Shows Home, Blogs, FAQs, About Us, Contact Us
   * - WITH location (has lat/long): Shows Home, Services, Providers, About Us, Contact Us
   * This determines which menu items appear in the header navigation
   */
  const locationData = useSelector((state) => state.location);
  const hasLatLong = locationData?.lat && locationData?.lng;

  const handleOpen = () => {
    dispatch(openLoginModal());
    setIsDrawerOpen(false);
  };

  const handleOpenRegisterAsProviderModal = () => {
    setRegisterAsProviderModalIsOpen(true);
    setIsDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const fcmId = userData?.web_fcm_id;

  const handleLogout = async (e) => {
    e.preventDefault();
    const response = await logoutApi({ fcm_id: fcmId });
    if (response?.error === false) {
      setOpenLogoutDialog(false);
      dispatch(clearUserData());
      dispatch(clearCart());
      signOut();
      router.push("/");
      toast.success(response?.message);
      // Log logout only after the server confirms the session is closed.
      logClarityEvent(AUTH_EVENTS.LOGOUT, {
        user_id: userData?.id,
        reason: "user_initiated",
      });
    } else {
      toast.error(t("somethingWentWrong"));
    }
  };

  const handleOpenLogoutDialog = (e) => {
    e.preventDefault();
    setOpenLogoutDialog(true);
  };

  // Use React Query hook for cart data - this will cache the data and prevent multiple API calls
  // The hook automatically updates Redux store when cart data is fetched
  // enabled: false when in reorder mode or checkout page to prevent unnecessary calls
  useCart({
    enabled: isLoggedIn && !isReorder && !isCheckoutPage,
  });

  // topHeader functions and states

  const [isOpen, setIsOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const { theme, setTheme: setNextTheme } = useTheme();
  const currentLanguage = useSelector(
    (state) => state.translation.currentLanguage,
  );
  const selectedLanguage = useSelector(
    (state) =>
      state.translation.selectedLanguage?.langCode || currentLanguage?.langCode,
  );

  // Use React Query hook for languages - this will cache the data and only fetch once
  // The hook uses staleTime: Infinity, so it won't refetch unless manually invalidated
  // This ensures the API is only called once and shared across all components
  const {
    languages = [],
    isLoading: isLoadingLangs,
    error: langError,
  } = useLanguage();

  // Fallback to config languages if API fails
  const displayLanguages =
    langError && languages.length === 0 ? config.supportedLanguages : languages;

  useEffect(() => {
    document.documentElement.dir = currentLanguage.isRtl ? "rtl" : "ltr";
  }, [currentLanguage.isRtl]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setNextTheme(newTheme);
    dispatch(setTheme(newTheme));
    logClarityEvent(AUTH_EVENTS.THEME_CHANGED, {
      theme: newTheme,
    });
  };

  const handleLanguageChange = async (value, options = {}) => {
    const { updateRoute = true, suppressErrorToast = false } = options;
    try {
      setIsOpen(false);
      setIsMobileLangOpen(false);

      const langObject = displayLanguages.find(
        (lang) => lang.langCode.toLowerCase() === value.toLowerCase(),
      );

      if (!langObject) {
        throw new Error("Language not found");
      }

      isChangingLanguageRef.current = langObject.langCode.toLowerCase();

      // First load translations
      const response = await getLanguageJsonDataApi({
        language_code: langObject.langCode,
        platform: "web",
        fcm_id: fcmToken,
      });

      if (response?.data) {
        if (!updateRoute && router.query?.lang) {
          const nextQuery = { ...router.query };
          delete nextQuery.lang;
          router.replace(
            {
              pathname: router.pathname,
              query: nextQuery,
            },
            undefined,
            { scroll: false, shallow: true }
          );
        }

        // Update Redux state synchronously
        dispatch(setReduxLanguage(langObject));
        dispatch(setTranslations(response.data));

        logClarityEvent(AUTH_EVENTS.LANGUAGE_CHANGED, {
          language_code: langObject.langCode,
          language_label: langObject.language,
        });

        // Update document direction
        document.documentElement.dir = langObject.isRtl ? "rtl" : "ltr";

        // Update URL
        if (updateRoute) {
          const currentQuery = { ...router.query };
          currentQuery.lang = langObject.langCode;
          await router.replace(
            {
              pathname: router.pathname,
              query: currentQuery,
            },
            undefined,
            { scroll: false }
          );
        }

        await queryClient.invalidateQueries({
          predicate: () => true,
          refetchType: "all",
        });

        setTimeout(() => {
          isChangingLanguageRef.current = null;
        }, 100);
      } else {
        throw new Error("No translation data received");
      }
    } catch (error) {
      console.error("Error changing language:", error);
      isChangingLanguageRef.current = null;
      if (!suppressErrorToast) {
        toast.error(t("errorLoadingTranslations"));
      }
    }
  };

  // Memoized language display to prevent unnecessary recalculations
  const getCurrentLanguageDisplay = useMemo(() => {
    if (isLoadingLangs) return t("loading");
    if (langError) return t("error");

    const lang = displayLanguages.find(
      (lang) => lang.langCode === selectedLanguage,
    );
    return lang?.language || currentLanguage?.language || t("selectLanguage");
  }, [isLoadingLangs, langError, displayLanguages, selectedLanguage, currentLanguage, t]);

  // Countdown timer for scheduled maintenance
  useEffect(() => {
    const isScheduledMaintenance = websettings?.customer_web_scheduled_maintenance_mode === "1";

    if (!isScheduledMaintenance) {
      setShowMaintenanceBanner(false);
      return;
    }
    const startDateTime = websettings?.customer_web_maintenance_mode_start_datetime;
    const endDateTime = websettings?.customer_web_maintenance_mode_end_datetime;

    if (!startDateTime || !endDateTime) {
      setShowMaintenanceBanner(false);
      return;
    }

    const checkMaintenanceStatus = () => {
      const now = dayjs().valueOf();
      const start = dayjs.utc(startDateTime).valueOf();
      const end = dayjs.utc(endDateTime).valueOf();

      if (now > end) {
        setShowMaintenanceBanner(false);
        return;
      }

      if (now < start) {
        setShowMaintenanceBanner(true);
      } else {
        setShowMaintenanceBanner(false);
        window.location.reload();
      }
    };

    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 1000);

    return () => clearInterval(interval);
  }, [websettings]);

  useEffect(() => {
    if (isChangingLanguageRef.current) return;
    if (isLoadingLangs || langError) return;
    if (!Array.isArray(displayLanguages) || displayLanguages.length === 0) return;

    const queryLang = Array.isArray(router.query.lang)
      ? router.query.lang[0]
      : router.query.lang;

    if (!queryLang) return;

    const normalizedQueryLang = queryLang.toLowerCase();
    const normalizedSelectedLang = selectedLanguage ? selectedLanguage.toLowerCase() : "";
    const normalizedCurrentLang = currentLanguage?.langCode ? currentLanguage.langCode.toLowerCase() : "";

    if (normalizedQueryLang === isChangingLanguageRef.current) return;
    if (normalizedSelectedLang === normalizedQueryLang || normalizedCurrentLang === normalizedQueryLang) return;

    handleLanguageChange(normalizedQueryLang, {
      updateRoute: false,
      suppressErrorToast: true,
    });
  }, [router.query.lang, displayLanguages, selectedLanguage, currentLanguage, isLoadingLangs, langError]);

  const handleMobileNav = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Compute navigation items based on location availability
  // This determines which menu items to show (with/without location)
  const navigationItems = useMemo(() => {
    return getNavigationItems(hasLatLong);
  }, [hasLatLong]);

  const languageDropdown = (
    <Select
      open={isOpen}
      onOpenChange={setIsOpen}
      value={selectedLanguage}
      onValueChange={handleLanguageChange}
      className="safari-select-fix"
    >
      <SelectTrigger
        className="bg-transparent w-auto text_color border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 rounded-md px-3 py-1.5 flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        {!isLoadingLangs && !langError && (
          <CustomImageTag
            src={
              displayLanguages.find(
                (lang) => lang.langCode === selectedLanguage
              )?.image || currentLanguage?.image
            }
            alt={getCurrentLanguageDisplay}
            width={0}
            height={0}
            className="w-5 aspect-square rounded-sm object-cover"
          />
        )}
       
      </SelectTrigger>

      <SelectContent
        className="z-[9999]"
        onPointerDownOutside={() => setIsOpen(false)}
      >
        {isLoadingLangs ? (
          <SelectItem value="loading" disabled>
            {t("loading")}...
          </SelectItem>
        ) : langError ? (
          <SelectItem value="error" disabled className="text-red-500">
            {t("errorLoadingLanguages")}
          </SelectItem>
        ) : (
          displayLanguages.map((lang) => (
            <SelectItem
              key={lang.langCode}
              value={lang.langCode}
              className="cursor-pointer hover:bg-gray-100 hover:text-gray-900 flex flex-row items-center gap-2 w-full"
            >
              <div className="flex items-center gap-2">
                <CustomImageTag
                  src={lang.image}
                  alt={lang.language}
                  width={0}
                  height={0}
                  className="mr-2 w-5 aspect-square"
                />
                <span>{lang.language}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );

  const themeToggle = (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      {theme === "dark" ? (
        <RiMoonClearLine className="primary_text_color cursor-pointer" size={22} onClick={toggleTheme} />
      ) : (
        <RiSunLine className="primary_text_color cursor-pointer" size={22} onClick={toggleTheme} />
      )}

      <button
        onClick={toggleTheme}
        className="w-12 h-6 bg-[#00000021] dark:bg-[var(--primary-color)] rounded-full p-1 flex items-center justify-between cursor-pointer relative safari-fix"
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform absolute ${
            theme === "dark"
              ? "rtl:-translate-x-6 ltr:translate-x-6"
              : "translate-x-0"
          }`}
        ></div>
      </button>
    </div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {showMaintenanceBanner && !isBannerClosed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden z-[99]"
          >
            <div className="bg-[#FFF4E5] border-b border-orange-200 text-gray-800">
              <div className="container mx-auto px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <MdWarning className="shrink-0 text-orange-500" size={30} />
                    <div>
                      <p className="font-semibold text-sm md:text-base leading-tight">
                        {t("scheduledMaintenanceTitle")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {t("scheduledMaintenanceDescription")}{" "}
                        <span className="font-medium text-gray-800">
                          {websettings?.customer_web_maintenance_mode_start_datetime &&
                          websettings?.customer_web_maintenance_mode_end_datetime
                            ? `${dayjs
                                .utc(
                                  websettings.customer_web_maintenance_mode_start_datetime
                                )
                                .local()
                                .format("D MMM, YYYY - h:mm A")} ${t("to")} ${dayjs
                                .utc(
                                  websettings.customer_web_maintenance_mode_end_datetime
                                )
                                .local()
                                .format("D MMM, YYYY - h:mm A")}`
                            : ""}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsBannerClosed(true)}
                    className="p-1 rounded-full hover:bg-black/5 transition shrink-0"
                    aria-label="Close maintenance banner"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="w-full sticky top-0 z-50 card_bg dark:bg-gray-900 !border-b !border-[#21212114] shadow-[0px_15px_47px_0px_rgba(0,0,0,0.04)]">
      <div>
        {/* Top header */}
        {/* <TopHeader /> */}

        {/* Main header */}
        <div className="safari-header w-full card_bg py-4 px-4 flex justify-between items-center flex-wrap md:flex-nowrap h-16 md:h-max">
          <div className="container mx-auto flex justify-between items-center">
            <CustomLink href={hasLatLong ? "/" : "/home"} title={t("home")} className="relative">
              <CustomImageTag
                src={websettings?.web_logo}
                alt={t("logo")}
                className="h-[40px] md:h-[40px] xl:h-[50px] aspect-logo max-w-[220px] safari-logo"
              />
            </CustomLink>



            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-4 xl:gap-6 text_color">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.key}
                  href={item.href}
                  label={t(item.labelKey)}
                  isActive={pathName === item.href || (item.key === 'home' && pathName === '/')}
                  title={t(item.labelKey)}
                />
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2 xl:gap-4">
              {/* Location Display/Action - Only on non-landing pages */}
              {!((pathName === "/" || pathName === "/home")) && (
                <div
                  className="hidden md:flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-gray-800 p-2 rounded-md max-w-[100px] xl:max-w-[200px]"
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  <IoLocationSharp size={20} className="primary_text_color min-w-[20px]" />
                  <span className="truncate text-sm font-medium">
                    {hasLatLong && locationData?.locationAddress
                      ? locationData.locationAddress
                      : t("addLocation")}
                  </span>
                </div>
              )}

              {isLoggedIn ? (
                <div
                  className={`flex items-center space-x-4 ${isRTL ? "space-x-reverse" : ""
                    }`}
                >
                  {isBecomeProviderPage && isRegisterAsProviderAllow && (
                    <button
                      onClick={handleOpenRegisterAsProviderModal}
                      className="bg-[#29363F] px-4 py-2 text-white rounded-lg flex items-center gap-2 hover:primary_bg_color transition-all duration-300"
                    >
                      {t("registerAsProvider")}
                    </button>
                  )}
                  {/* Language Dropdown near cart on left side */}
                  <div className="hidden lg:block">{languageDropdown}</div>
                  {/* Cart Dialog - Single Instance */}
                  {!isCheckoutPage && !isCartPage && hasLatLong && (
                    <div className="relative">
                      <CartDialog
                        totalItems={totalItems}
                        isVisible={cartVisibleDeskTop}
                        onOpenChange={setCartVisibleDeskTop}
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                    <AccountDialog
                      userData={userData}
                      handleLogout={handleOpenLogoutDialog}
                      isVisible={accountVisible}
                      onOpenChange={setAccountVisible}
                      themeToggle={themeToggle}
                    />
                  </div>
                  </div>
                  
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Language before login button */}
                  <div className="hidden lg:block">{languageDropdown}</div>
                  
                  {isBecomeProviderPage && isRegisterAsProviderAllow ? (
                    <button
                      onClick={handleOpenRegisterAsProviderModal}
                      className="bg-[#29363F] px-4 py-2 text-white rounded-lg flex items-center gap-2 hover:primary_bg_color transition-all duration-300"
                    >
                      {t("registerAsProvider")}
                    </button>
                  ) : (
                    <button
                      className="primary_bg_color px-4 py-2 text-white rounded-lg"
                      onClick={handleOpen}
                    >
                      {t("login")}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger / Close Icon */}
            <div className="flex items-center gap-4 md:hidden">
              {isLoggedIn && !isCheckoutPage && !isCartPage && (
                <CustomLink href={"/cart"}>
                  <div className="relative text-white primary_bg_color h-[36px] w-[36px] rounded-[8px] p-2 flex items-center justify-center cursor-pointer">
                    <FaShoppingCart
                      size={18}
                      className={`${isRTL ? "transform scale-x-[-1]" : ""}`}
                    />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {totalItems}
                      </span>
                    )}
                  </div>
                </CustomLink>
              )}
  
              <button
                className="description_color dark:text-white md:hidden"
                onClick={() => handleMobileNav()}
              >
                {isDrawerOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Mobile Navigation Toggle */}

            <div className="hidden lg:hidden md:flex items-center space-x-4">
              {isLoggedIn && !isCheckoutPage && !isCartPage && hasLatLong && (
                <div className={`relative ${isRTL ? "ml-2" : ""}`}>
                  <CartDialog
                    totalItems={totalItems}
                    isVisible={cartVisibleMobile}
                    onOpenChange={setCartVisibleMobile}
                  />
                </div>
              )}
              <Sheet
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                side={isRTL ? "left" : "right"}
              >
                <SheetTrigger asChild>
                  <button
                    className="description_color dark:text-white"
                    onClick={toggleDrawer}
                  >
                    <FaBars size={24} />
                  </button>
                </SheetTrigger>
                {/* Drawer Content - Opens from Right */}
                <SheetContent className="w-[85%] sm:w-[350px] p-0">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <SidebarContent
                      t={t}
                      pathName={pathName}
                      userData={userData}
                      isLoggedIn={isLoggedIn}
                      isBecomeProviderPage={isBecomeProviderPage}
                      isRegisterAsProviderAllow={isRegisterAsProviderAllow}
                      handleOpen={handleOpen}
                      handleOpenRegisterAsProviderModal={
                        handleOpenRegisterAsProviderModal
                      }
                      handleOpenLogoutDialog={handleOpenLogoutDialog}
                      toggleDropdown={toggleDropdown}
                      dropdownStates={dropdownStates}
                      router={router}
                      // Language props
                      languages={displayLanguages}
                      isLoadingLangs={isLoadingLangs}
                      langError={langError}
                      selectedLanguage={selectedLanguage}
                      getCurrentLanguageDisplay={getCurrentLanguageDisplay}
                      handleLanguageChange={handleLanguageChange}
                      isMobileLangOpen={isMobileLangOpen}
                      setIsMobileLangOpen={setIsMobileLangOpen}
                      // Theme props
                      theme={theme}
                      toggleTheme={toggleTheme}
                      // Web settings
                      websettings={websettings}
                      // Navigation
                      navigationItems={navigationItems}
                      hasLatLong={hasLatLong}
                      locationData={locationData}
                      setIsLocationModalOpen={setIsLocationModalOpen}
                    />
                  </Suspense>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      {
        isLoginModalOpen && (
          <LoginModal
            open={isLoginModalOpen}
            close={() => dispatch(closeLoginModal())}
            setOpenProfileModal={setOpenProfileModal}
            setOpenSetPasswordModal={setOpenSetPasswordModal}
          />
        )
      }
      {
        openProfileModal && (
          <EditProfileModal
            open={openProfileModal}
            close={() => setOpenProfileModal(false)}
            isEditProfile={false}
          />
        )
      }
      {
        openSetPasswordModal && (
          <SetPasswordModal
            open={openSetPasswordModal}
            close={() => setOpenSetPasswordModal(false)}
          />
        )
      }

      {
        openLogoutDialog && (
          <LogoutDialog
            isOpen={openLogoutDialog}
            onClose={() => setOpenLogoutDialog(false)}
            onLogout={handleLogout}
          />
        )
      }
      {
        isRegisterAsProviderModalOpen && (
          <>
            <RegisterAsProviderModal
              isOpen={isRegisterAsProviderModalOpen}
              onClose={() => {
                setRegisterAsProviderModalIsOpen(false);
              }}
            />
          </>
        )
      }

      {
        isLocationModalOpen && (
          <LocationModal
            open={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            initialLocation={
              hasLatLong
                ? {
                  lat: locationData.lat,
                  lng: locationData.lng,
                  address: locationData.locationAddress,
                }
                : websettings?.default_latitude && websettings?.default_longitude
                  ? {
                    lat: websettings.default_latitude,
                    lng: websettings.default_longitude,
                    address: "",
                  }
                  : null
            }
            redirectToHome={false}
            forceChooseAddressOnOpen={true}
          />
        )
      }
    </header >
    </>
  );
};

export default Header;
