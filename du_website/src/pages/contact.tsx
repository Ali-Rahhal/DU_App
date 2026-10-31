import React, { FormEvent, useState } from "react";
import Image from "next/image";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
} from "react-icons/fa6";

import Layout from "@/components/Layout/Layout";
import PageHeading from "@/components/common/PageHeading";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import { useTranslations } from "next-intl";
import { sendContactEmail } from "@/utils/apiCalls";

interface ContactForm {
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

const Contact = () => {
  const t = useTranslations();

  const {
    companyHydrated,
    companyAboutImage,
    companyLogo,
    companyName,
    companyDescription,
    companyCopyright,
    companyLocation,
    companyEmail,
    companyPhone,
    companyFacebook,
    companyLinkedin,
    companyInstagram,
  } = useCompanyAssets();

  const [form, setForm] = useState<ContactForm>({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (sending) return;

    try {
      setSending(true);

      await sendContactEmail({
        companyEmail,
        fullName: form.fullName,
        phone: form.phone,
        clientEmail: form.email,
        message: form.message,
      });

      toast.success(t("contact_page.form.success"));

      setForm({
        fullName: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? t("contact_page.form.error_default"),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <PageHeading
        title={t("contact_page.heading.title")}
        subtitle={t("contact_page.heading.subtitle")}
        image={companyHydrated ? companyAboutImage : ""}
      />

      <section className="contact-page py-5 py-md-7">
        <div className="container">
          {!companyHydrated ? (
            <div className="contact-loading">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {/* Contact links */}
              <div className="contact-information">
                <h3>{t("contact_page.connect.title")}</h3>
                <p className="contact-section-subtitle">
                  {t("contact_page.connect.subtitle")}
                </p>

                <div className="contact-links">
                  {companyFacebook && (
                    <a
                      href={companyFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      <span className="contact-link-icon">
                        <FaFacebook />
                      </span>
                      <span>
                        <small>{t("contact_page.links.facebook")}</small>
                        <strong>
                          {t("contact_page.links.facebook_action")}
                        </strong>
                      </span>
                    </a>
                  )}

                  {companyInstagram && (
                    <a
                      href={companyInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      <span className="contact-link-icon">
                        <FaInstagram />
                      </span>
                      <span>
                        <small>{t("contact_page.links.instagram")}</small>
                        <strong>
                          {t("contact_page.links.instagram_action")}
                        </strong>
                      </span>
                    </a>
                  )}

                  {companyLinkedin && (
                    <a
                      href={companyLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      <span className="contact-link-icon">
                        <FaLinkedin />
                      </span>
                      <span>
                        <small>{t("contact_page.links.linkedin")}</small>
                        <strong>
                          {t("contact_page.links.linkedin_action")}
                        </strong>
                      </span>
                    </a>
                  )}

                  {companyPhone && (
                    <a href={`tel:${companyPhone}`} className="contact-link">
                      <span className="contact-link-icon">
                        <FaPhone />
                      </span>
                      <span>
                        <small>{t("contact_page.links.phone")}</small>
                        <strong>{companyPhone}</strong>
                      </span>
                    </a>
                  )}

                  {companyEmail && (
                    <a href={`mailto:${companyEmail}`} className="contact-link">
                      <span className="contact-link-icon">
                        <FaEnvelope />
                      </span>
                      <span>
                        <small>{t("contact_page.links.email")}</small>
                        <strong>{companyEmail}</strong>
                      </span>
                    </a>
                  )}

                  {companyLocation && (
                    <a
                      href={companyLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      <span className="contact-link-icon">
                        <FaLocationDot />
                      </span>
                      <span>
                        <small>{t("contact_page.links.location")}</small>
                        <strong>
                          {t("contact_page.links.location_action")}
                        </strong>
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Contact form */}
              <div className="contact-form-section">
                <div className="contact-form-heading">
                  <span>{t("contact_page.form.eyebrow")}</span>
                  <h3>{t("contact_page.form.title")}</h3>
                  <p>{t("contact_page.form.subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="fullName">
                          {t("contact_page.form.full_name")}{" "}
                          {t("contact_page.form.required")}
                        </label>
                        <input
                          id="fullName"
                          className="form-control"
                          type="text"
                          name="fullName"
                          placeholder={t(
                            "contact_page.form.full_name_placeholder",
                          )}
                          value={form.fullName}
                          onChange={updateField}
                          required
                          maxLength={120}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="phone">
                          {t("contact_page.form.phone")}
                        </label>
                        <input
                          id="phone"
                          className="form-control"
                          type="tel"
                          name="phone"
                          placeholder={t("contact_page.form.phone_placeholder")}
                          value={form.phone}
                          onChange={updateField}
                          maxLength={30}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="email">
                          {t("contact_page.form.email")}{" "}
                          {t("contact_page.form.required")}
                        </label>
                        <input
                          id="email"
                          className="form-control"
                          type="email"
                          name="email"
                          placeholder={t("contact_page.form.email_placeholder")}
                          value={form.email}
                          onChange={updateField}
                          required
                          maxLength={254}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="message">
                          {t("contact_page.form.message")}{" "}
                          {t("contact_page.form.required")}
                        </label>
                        <textarea
                          id="message"
                          className="form-control"
                          name="message"
                          placeholder={t(
                            "contact_page.form.message_placeholder",
                          )}
                          rows={6}
                          value={form.message}
                          onChange={updateField}
                          required
                          maxLength={5000}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="contact-submit">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={sending}
                        >
                          {sending ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              {t("contact_page.form.sending")}
                            </>
                          ) : (
                            t("contact_page.form.send")
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Company information */}
              <div className="contact-company">
                <div className="contact-company-logo">
                  {companyLogo && (
                    <Image
                      src={companyLogo}
                      alt={companyName}
                      width={220}
                      height={90}
                      style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "220px",
                        maxHeight: "90px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>

                <h2>{companyName}</h2>

                <p className="contact-company-description">
                  {t(companyDescription)}
                </p>

                <div className="contact-company-copyright">
                  {t(companyCopyright)}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
