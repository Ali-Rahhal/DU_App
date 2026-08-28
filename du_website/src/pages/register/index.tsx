import { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import ReactCountryFlag from "react-country-flag";
import { Map, Mail } from "lucide-react";

import { useCompanyStore } from "@/store/zustand";
import { Companies } from "@/utils/config_companies";
import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";

import { sendRegistrationCode, verifyRegistrationCode } from "@/utils/apiCalls";

const REGIONS = [
  { name: "Akkar", code: "AKKAR" },
  { name: "Baalbek-Hermel", code: "BAALBEK" },
  { name: "Beirut", code: "BEIRUT" },
  { name: "Beqaa", code: "BEQAA" },
  { name: "Keserwan-Jbeil", code: "KESERWAN" },
  { name: "Mount Lebanon", code: "MOUNT" },
  { name: "Nabatieh", code: "NABATIEH" },
  { name: "North Lebanon", code: "NORTH" },
  { name: "South Lebanon", code: "SOUTH" },
];

const PHONE_COUNTRIES = [
  { code: "+961", country: "LB", name: "Lebanon" },
  { code: "+963", country: "SY", name: "Syria" },
  { code: "+962", country: "JO", name: "Jordan" },
  { code: "+971", country: "AE", name: "UAE" },
  { code: "+966", country: "SA", name: "Saudi Arabia" },
  { code: "+974", country: "QA", name: "Qatar" },
  { code: "+965", country: "KW", name: "Kuwait" },
  { code: "+1", country: "US", name: "United States" },
  { code: "+44", country: "GB", name: "United Kingdom" },
];

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  const [mohNumber, setMohNumber] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phoneCountryCode, setPhoneCountryCode] = useState("+961");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [email, setEmail] = useState("");

  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    pharmacyName: "",
    mohNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationTimeLeft, setVerificationTimeLeft] = useState(600);
  const [resendingCode, setResendingCode] = useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const { companyId } = useCompanyStore();

  const router = useRouter();
  const t = useTranslations("login_register");

  const company = Companies[companyId];

  const selectedCountry =
    PHONE_COUNTRIES.find((country) => country.code === phoneCountryCode) ??
    PHONE_COUNTRIES[0];

  // --------------------------------------------------
  // Close country dropdown when clicking outside
  // --------------------------------------------------

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --------------------------------------------------
  // Verification timer
  // --------------------------------------------------

  useEffect(() => {
    if (!showVerificationModal || verificationTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setVerificationTimeLeft((time) => Math.max(0, time - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [showVerificationModal, verificationTimeLeft]);

  // --------------------------------------------------
  // GPS
  // --------------------------------------------------

  function captureLocation() {
    if (!navigator.geolocation) {
      toast.error(t("errors.geolocation_not_supported"));
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());

        setGettingLocation(false);

        toast.success(t("location_captured"));
      },
      (error) => {
        setGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(t("errors.location_permission_denied"));
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error(t("errors.location_unavailable"));
            break;

          case error.TIMEOUT:
            toast.error(t("errors.location_timeout"));
            break;

          default:
            toast.error(t("errors.location_failed"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  // --------------------------------------------------
  // Validate contact information
  // --------------------------------------------------

  function validateContactInfo() {
    const newErrors = {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      pharmacyName: "",
      mohNumber: "",
    };

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      newErrors.firstName = t("errors.first_name_required");
    }

    if (!trimmedLastName) {
      newErrors.lastName = t("errors.last_name_required");
    }

    if (!trimmedPhoneNumber) {
      newErrors.phoneNumber = t("errors.phone_required");
    } else if (!/^\d{7,15}$/.test(trimmedPhoneNumber)) {
      newErrors.phoneNumber = t("errors.phone_invalid");
    }

    if (!trimmedEmail) {
      newErrors.email = t("errors.email_required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = t("errors.email_invalid");
      }
    }

    setErrors((prev) => ({
      ...prev,
      firstName: newErrors.firstName,
      lastName: newErrors.lastName,
      phoneNumber: newErrors.phoneNumber,
      email: newErrors.email,
    }));

    return !Object.values(newErrors).some(Boolean);
  }

  // --------------------------------------------------
  // Validate pharmacy details
  // --------------------------------------------------

  function validatePharmacyDetails() {
    const newErrors = {
      pharmacyName: "",
      mohNumber: "",
    };

    const trimmedMohNumber = mohNumber.trim();
    const trimmedPharmacyName = pharmacyName.trim();

    if (!trimmedPharmacyName) {
      newErrors.pharmacyName = t("errors.pharmacy_name_required");
    }

    if (!trimmedMohNumber) {
      newErrors.mohNumber = t("errors.moh_number_required");
    } else if (!/^MOH-\d{4}-\d{6}$/.test(trimmedMohNumber)) {
      newErrors.mohNumber = t("errors.moh_number_invalid");
    }

    setErrors((prev) => ({
      ...prev,
      pharmacyName: newErrors.pharmacyName,
      mohNumber: newErrors.mohNumber,
    }));

    return !Object.values(newErrors).some(Boolean);
  }

  // --------------------------------------------------
  // Continue to pharmacy details
  // --------------------------------------------------

  function handleContinue() {
    if (!validateContactInfo()) {
      return;
    }

    setActiveTab(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // Submit registration
  // --------------------------------------------------

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!validatePharmacyDetails()) {
      return;
    }

    setLoading(true);

    try {
      await sendRegistrationCode({
        moh_number: mohNumber.trim(),
        phone_number: `${phoneCountryCode}${phoneNumber.trim()}`,
        email: email.trim(),
        description: pharmacyName.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      setShowVerificationModal(true);
      setVerificationTimeLeft(600);

      toast.success(t("verification_code_sent"));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? t("errors.registration_failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Resend verification code
  // --------------------------------------------------

  async function handleResendCode() {
    try {
      setResendingCode(true);

      await sendRegistrationCode({
        moh_number: mohNumber.trim(),
        phone_number: `${phoneCountryCode}${phoneNumber.trim()}`,
        email: email.trim(),
        description: pharmacyName.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      setVerificationCode("");
      setVerificationTimeLeft(600);

      toast.success(t("code_resent"));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? t("errors.resend_code_failed"),
      );
    } finally {
      setResendingCode(false);
    }
  }

  // --------------------------------------------------
  // Verify code
  // --------------------------------------------------

  async function handleVerifyCode() {
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      toast.error(t("errors.verification_code_required"));
      return;
    }

    setVerificationLoading(true);

    try {
      await verifyRegistrationCode({
        moh_number: mohNumber.trim(),
        phone_number: `${phoneCountryCode}${phoneNumber.trim()}`,
        email: email.trim(),
        description: pharmacyName.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        code: verificationCode.trim(),
        longitude: longitude || undefined,
        latitude: latitude || undefined,
        region: region || undefined,
        address: address.trim() || undefined,
      });

      setShowVerificationModal(false);

      toast.success(t("registration_success"));

      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? t("errors.verification_failed"),
      );
    } finally {
      setVerificationLoading(false);
    }
  }

  return (
    <div className="register-page">
      {/* Language */}
      <div className="register-language">
        <ChangeLangDropdown />
      </div>

      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <button
            type="button"
            className="register-back-btn"
            disabled={loading}
            onClick={() => router.push("/login")}
          >
            <i className="ti ti-arrow-left" />
          </button>

          <div className="register-header-content">
            <img
              src={company?.logo}
              alt={company?.name}
              className="register-company-logo mb-5"
            />

            <h1>{t("register")}</h1>

            <p className="register-subtitle">
              {t("register_pharmacy_description")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="register-tabs">
          <button
            type="button"
            className={`register-tab ${activeTab === 1 ? "active" : ""}`}
            onClick={() => setActiveTab(1)}
          >
            <span className="register-tab-number">1</span>

            <span>
              <strong>{t("contact_info")}</strong>
              <small>{t("your_contact_details")}</small>
            </span>
          </button>

          <div className="register-tab-line" />

          <button
            type="button"
            className={`register-tab ${activeTab === 2 ? "active" : ""}`}
            disabled={activeTab === 1}
            onClick={() => {
              if (validateContactInfo()) {
                setActiveTab(2);
              }
            }}
          >
            <span className="register-tab-number">2</span>

            <span>
              <strong>{t("pharmacy_details")}</strong>
              <small>{t("your_pharmacy_information")}</small>
            </span>
          </button>
        </div>

        <form onSubmit={handleRegister}>
          {/* ==================================================
              STEP 1
          ================================================== */}
          {activeTab === 1 && (
            <div className="register-step">
              {/* First + Last Name */}
              <div className="register-name-row">
                <div className="register-field">
                  <label className="register-label">
                    {t("first_name")} <span>*</span>
                  </label>

                  <input
                    type="text"
                    className={`form-control ${errors.firstName ? "is-invalid-register" : ""}`}
                    placeholder={t("first_name_placeholder")}
                    value={firstName}
                    disabled={loading}
                    autoComplete="given-name"
                    onChange={(e) => {
                      setFirstName(e.target.value);

                      if (errors.firstName) {
                        setErrors((prev) => ({
                          ...prev,
                          firstName: "",
                        }));
                      }
                    }}
                  />

                  {errors.firstName && (
                    <small className="register-field-error">
                      {errors.firstName}
                    </small>
                  )}
                </div>

                <div className="register-field">
                  <label className="register-label">
                    {t("last_name")} <span>*</span>
                  </label>

                  <input
                    type="text"
                    className={`form-control ${errors.lastName ? "is-invalid-register" : ""}`}
                    placeholder={t("last_name_placeholder")}
                    value={lastName}
                    disabled={loading}
                    autoComplete="family-name"
                    onChange={(e) => {
                      setLastName(e.target.value);

                      if (errors.lastName) {
                        setErrors((prev) => ({
                          ...prev,
                          lastName: "",
                        }));
                      }
                    }}
                  />

                  {errors.lastName && (
                    <small className="register-field-error">
                      {errors.lastName}
                    </small>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="register-field">
                <label className="register-label">
                  {t("email_address")} <span>*</span>
                </label>

                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid-register" : ""}`}
                  placeholder={t("email_placeholder")}
                  value={email}
                  disabled={loading}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "",
                      }));
                    }
                  }}
                />

                {errors.email && (
                  <small className="register-field-error">{errors.email}</small>
                )}
              </div>

              {/* Phone */}
              <div className="register-field">
                <label className="register-label">
                  {t("contact_mobile_number")} <span>*</span>
                </label>

                <div className="phone-input-group">
                  {/* Custom country selector */}
                  <div
                    className="phone-country-wrapper"
                    ref={countryDropdownRef}
                  >
                    <button
                      type="button"
                      className="phone-country-button"
                      disabled={loading}
                      onClick={() => setCountryDropdownOpen((open) => !open)}
                    >
                      <ReactCountryFlag
                        countryCode={selectedCountry.country}
                        svg
                        className="phone-country-flag"
                      />

                      <span>{selectedCountry.code}</span>

                      <i className="ti ti-chevron-down" />
                    </button>

                    {countryDropdownOpen && (
                      <div className="phone-country-menu">
                        {PHONE_COUNTRIES.map((country) => (
                          <button
                            type="button"
                            key={country.code}
                            className={`phone-country-option ${
                              phoneCountryCode === country.code
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              setPhoneCountryCode(country.code);
                              setCountryDropdownOpen(false);
                            }}
                          >
                            <ReactCountryFlag
                              countryCode={country.country}
                              svg
                              className="phone-country-flag"
                            />

                            <span className="phone-country-name">
                              {country.name}
                            </span>

                            <span className="phone-country-code">
                              {country.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    className={`form-control phone-number-input ${
                      errors.phoneNumber ? "is-invalid-register" : ""
                    }`}
                    placeholder={t("phone_placeholder")}
                    value={phoneNumber}
                    disabled={loading}
                    autoComplete="tel-national"
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, ""));

                      if (errors.phoneNumber) {
                        setErrors((prev) => ({
                          ...prev,
                          phoneNumber: "",
                        }));
                      }
                    }}
                  />
                </div>
                {errors.phoneNumber && (
                  <small className="register-field-error">
                    {errors.phoneNumber}
                  </small>
                )}
              </div>

              {/* Continue */}
              <button
                type="button"
                className="register-submit-btn register-continue-btn"
                disabled={loading}
                onClick={handleContinue}
              >
                <span>{t("continue")}</span>
                <i className="ti ti-arrow-right" />
              </button>
            </div>
          )}

          {/* ==================================================
              STEP 2
          ================================================== */}
          {activeTab === 2 && (
            <div className="register-step">
              {/* Pharmacy Name */}
              <div className="register-field">
                <label className="register-label">
                  {t("pharmacy_name")} <span>*</span>
                </label>

                <input
                  type="text"
                  className={`form-control ${
                    errors.pharmacyName ? "is-invalid-register" : ""
                  }`}
                  placeholder={t("pharmacy_name_placeholder")}
                  value={pharmacyName}
                  disabled={loading}
                  onChange={(e) => {
                    setPharmacyName(e.target.value);

                    if (errors.pharmacyName) {
                      setErrors((prev) => ({
                        ...prev,
                        pharmacyName: "",
                      }));
                    }
                  }}
                />

                {errors.pharmacyName && (
                  <small className="register-field-error">
                    {errors.pharmacyName}
                  </small>
                )}
              </div>
              {/* License Number */}
              <div className="register-field">
                <label className="register-label">
                  {t("pharmacy_license_number")} <span>*</span>
                </label>

                <input
                  type="text"
                  maxLength={15}
                  className={`form-control ${
                    errors.mohNumber ? "is-invalid-register" : ""
                  }`}
                  placeholder={t("license_number_placeholder")}
                  value={mohNumber}
                  disabled={loading}
                  onChange={(e) => {
                    setMohNumber(e.target.value.toUpperCase());

                    if (errors.mohNumber) {
                      setErrors((prev) => ({
                        ...prev,
                        mohNumber: "",
                      }));
                    }
                  }}
                />

                {errors.mohNumber && (
                  <small className="register-field-error">
                    {errors.mohNumber}
                  </small>
                )}
              </div>
              {/* Region */}
              <div className="register-field">
                <label className="register-label">
                  {t("region")} <span>({t("optional")})</span>
                </label>

                <select
                  className="form-control register-select"
                  value={region}
                  disabled={loading}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">{t("select_region")}</option>

                  {REGIONS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Address */}
              <div className="register-field">
                <label className="register-label">
                  {t("full_address")} <span>({t("optional")})</span>
                </label>

                <textarea
                  className="form-control register-textarea"
                  placeholder={t("address_placeholder")}
                  value={address}
                  disabled={loading}
                  rows={3}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              {/* GPS Location */}
              <div className="register-field">
                <label className="register-label">
                  {t("pharmacy_location")} <span>({t("optional")})</span>
                </label>
                <div className="gps-input-row">
                  <div className="gps-status">
                    <Map size={17} />
                    <div>
                      {latitude && longitude ? (
                        <>
                          <strong>{t("location_captured")}</strong>
                          <small>
                            {t("lat")}: {latitude} &nbsp;•&nbsp; {t("lng")}:
                            {longitude}
                          </small>
                        </>
                      ) : (
                        <>
                          <strong>{t("location_description")}</strong>
                          <small>{t("capture_gps")}</small>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="location-btn"
                    disabled={loading || gettingLocation}
                    onClick={captureLocation}
                  >
                    {gettingLocation ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <span>{t("getting_location")}</span>
                      </>
                    ) : (
                      <>
                        <i className="ti ti-map-pin" />
                        <span>
                          {latitude && longitude
                            ? t("update_location")
                            : t("capture_gps")}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              {/* Actions */}
              <div className="register-step-actions">
                <button
                  type="button"
                  className="register-secondary-btn"
                  disabled={loading}
                  onClick={() => setActiveTab(1)}
                >
                  <i className="ti ti-arrow-left" />
                  <span>{t("back")}</span>
                </button>

                <button
                  type="submit"
                  className="register-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>{t("sending")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("submit_request")}</span>
                      <i className="ti ti-arrow-right" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ==================================================
          Verification Modal
      ================================================== */}
      {showVerificationModal && (
        <div className="verification-modal-overlay">
          <div className="verification-modal">
            <div className="verification-icon">
              <Mail size={18} />
            </div>

            <h2>{t("verify_email")}</h2>

            <p>{t("verification_code_description")}</p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="form-control verification-code-input"
              placeholder={t("verification_code")}
              value={verificationCode}
              disabled={verificationLoading}
              onChange={(e) =>
                setVerificationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
            />

            <p className="verification-timer">
              {verificationTimeLeft > 0
                ? `${t("code_expires_in")} ${Math.floor(
                    verificationTimeLeft / 60,
                  )}:${String(verificationTimeLeft % 60).padStart(2, "0")}`
                : t("code_expired")}
            </p>

            <button
              type="button"
              className="verification-resend-btn"
              disabled={resendingCode || verificationTimeLeft > 0}
              onClick={handleResendCode}
            >
              {resendingCode ? t("resending") : t("resend_code")}
            </button>

            <div className="verification-modal-actions">
              <button
                type="button"
                className="verification-cancel-btn"
                disabled={verificationLoading || resendingCode}
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode("");
                }}
              >
                {t("cancel")}
              </button>

              <button
                type="button"
                className="register-submit-btn"
                disabled={
                  verificationLoading ||
                  resendingCode ||
                  verificationTimeLeft === 0 ||
                  verificationCode.length !== 6
                }
                onClick={handleVerifyCode}
              >
                {verificationLoading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>{t("verifying")}</span>
                  </>
                ) : (
                  t("verify")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
