import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only force scroll to top for new navigations (PUSH or REPLACE)
    // If it's a POP (e.g., clicking the browser's back button), let the browser handle
    // restoring the previous scroll position naturally.
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}
