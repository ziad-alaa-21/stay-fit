import { useEffect } from "react";

export function StorefrontRedirect() {
  useEffect(() => {
    window.location.replace("/storefront.html");
  }, []);
  
  return <div className="min-h-screen bg-stay-black" />;
}
