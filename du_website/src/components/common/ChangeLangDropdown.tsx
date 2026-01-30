import { useRouter } from "next/router";
import React from "react";

const ChangeLangDropdown = () => {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;
  const changeLocale = (newLocale) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };
  return (
    <select
      name="countries"
      className="locale-select"
      onChange={(e) => changeLocale(e.target.value)}
      value={locale}
    >
      <option value="fr">🇫🇷&emsp;French</option>
      <option value="en">🇬🇧&emsp;English</option>
    </select>
  );
};

export default ChangeLangDropdown;
