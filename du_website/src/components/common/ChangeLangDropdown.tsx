import { useRouter } from "next/router";
import { Dropdown } from "react-bootstrap";
import ReactCountryFlag from "react-country-flag";

const ChangeLangDropdown = () => {
  const router = useRouter();

  const { locale, pathname, asPath, query } = router;

  const changeLocale = (newLocale: string) => {
    router.push(
      {
        pathname,
        query,
      },
      asPath,
      {
        locale: newLocale,
      },
    );
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" className="language-toggle">
        <ReactCountryFlag
          countryCode={locale === "fr" ? "FR" : "GB"}
          svg
          style={{ width: "2em", height: "2em" }}
        />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          active={locale === "fr"}
          onClick={() => changeLocale("fr")}
        >
          <ReactCountryFlag
            countryCode="FR"
            svg
            style={{ width: "1.5em", height: "1.5em", marginRight: "8px" }}
          />
          Français
        </Dropdown.Item>

        <Dropdown.Item
          active={locale === "en"}
          onClick={() => changeLocale("en")}
        >
          <ReactCountryFlag
            countryCode="GB"
            svg
            style={{ width: "1.5em", height: "1.5em", marginRight: "8px" }}
          />
          English
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ChangeLangDropdown;
