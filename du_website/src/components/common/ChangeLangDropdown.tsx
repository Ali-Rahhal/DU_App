import { useRouter } from "next/router";
import { Dropdown } from "react-bootstrap";

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
        {locale === "fr" ? "🇫🇷 French" : "🇬🇧 English"}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          active={locale === "fr"}
          onClick={() => changeLocale("fr")}
        >
          🇫🇷 French
        </Dropdown.Item>

        <Dropdown.Item
          active={locale === "en"}
          onClick={() => changeLocale("en")}
        >
          🇬🇧 English
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ChangeLangDropdown;
