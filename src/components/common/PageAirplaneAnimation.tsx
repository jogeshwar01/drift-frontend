import { useEffect, useState } from "react";
import { Flight as FlightIcon } from "@mui/icons-material";

export const PageAirplaneAnimation = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the animation after it completes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Match this with the animation duration

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-0 w-screen pointer-events-none z-50">
      <div className="absolute animate-page-fly">
        <FlightIcon className="text-chart-4 rotate-45 !w-16 !h-16" />
      </div>
    </div>
  );
};
