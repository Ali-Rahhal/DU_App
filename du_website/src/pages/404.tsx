import { useRouter } from "next/router";
import React, { useEffect } from "react";

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after component mounts
    router.replace("/");
  }, [router]);

  // Optional: show a message while redirecting
  return <div>404 - Redirecting to home page...</div>;
};

export default NotFound;
