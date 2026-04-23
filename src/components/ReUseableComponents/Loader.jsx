import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import ImagePlaceholder from "../../assets/placeholder.svg";

const Loader = () => {
  const settings = useSelector(
    (state) => state.settingsData?.settings?.web_settings
  );
  const placeholderLogo = settings?.web_logo || ImagePlaceholder;

  const logoRef = useRef(null);
  const [barStyle, setBarStyle] = useState({ width: 0, height: 0 });

  const handleLogoLoad = () => {
    if (logoRef.current) {
      setBarStyle({ width: logoRef.current.offsetWidth });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen light_bg_color gap-3">
      {/* Logo */}
      <img
        ref={logoRef}
        src={placeholderLogo}
        alt="Logo"
        onLoad={handleLogoLoad}
        className="h-14 w-auto object-contain block"
      />

      {/* Progress bar - dimensions driven by logo */}
      {barStyle.width > 0 && (
        <div
          className="loader-progress-track"
          style={{ width: barStyle.width }}
        >
          <div className="loader-progress-fill" />
        </div>
      )}

      <style>{`
        .loader-progress-track {
          height: 15px;
          border-radius: 999px;
          border: 2px solid var(--primary-color);
          background: transparent;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }

        .loader-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0%;
          border-radius: 999px;
          background: var(--primary-color);
          animation: loaderFill 1s ease-in-out infinite;
        }

        @keyframes loaderFill {
          0%   { width: 0%;   opacity: 1; }
          80%  { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
