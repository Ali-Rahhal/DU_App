import { Promotion } from "@/Models/Promotion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "react-bootstrap";

const PromotionContainer = ({ promotion }: { promotion: Promotion }) => {
  const t = useTranslations();
  return (
    <>
      <div className="promotion_con">
        <div>
          <p className="title">{promotion.description}</p>
          <p className="date">
            <span>{t("start_date")}:</span>{" "}
            {new Date(promotion.start_date).toLocaleDateString("en-GB")}
          </p>
          <p className="date">
            <span>{t("end_date")}:</span>{" "}
            {new Date(promotion.end_date).toLocaleDateString("en-GB")}
          </p>
        </div>
        <section className="font-weight-bold mr-1">
          <span
            style={{
              color: "#f59f00",
              textTransform: "uppercase",
              paddingBottom: "0.5rem",
            }}
          >
            {" "}
            {t("buy")} <br />
          </span>{" "}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {promotion?.conditions?.map((condition, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "column",
                  fontSize: "0.8rem",
                }}
              >
                <Link
                  href={`/products/${condition.condition_type_code}`}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flexDirection: "row",
                    border: "1px solid rgba(0,0,0,0.1)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "6px",
                    gap: "0.5rem",
                  }}
                >
                  <Image
                    src={
                      condition.images[0] ||
                      process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
                    }
                    width={50}
                    height={50}
                    alt={condition.item_description}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span>{condition.item_description}</span>
                    <span
                      key={index}
                      style={{
                        color: "#868e96",
                        fontSize: "0.7rem",
                      }}
                    >
                      {condition.description}
                    </span>
                  </div>
                </Link>
                {index !== promotion.conditions.length - 1 && (
                  <span
                    style={{
                      textAlign: "center",
                      fontSize: "18px",
                      fontWeight: "900",
                      color: "#f59f00",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("or")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="font-weight-bold mr-1">
          <span
            style={{
              color: "green",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            {" "}
            {t("get")} <br />
          </span>{" "}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {promotion?.results?.map((result, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "column",
                  fontSize: "0.8rem",
                }}
              >
                <Link
                  href={`/products/${result.result_type_code}`}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flexDirection: "row",
                    border: "1px solid rgba(0,0,0,0.1)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "6px",
                    gap: "0.5rem",
                  }}
                >
                  <Image
                    src={
                      result.images[0] ||
                      process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
                    }
                    width={50}
                    height={50}
                    alt={result.item_description}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span>{result.item_description}</span>
                    <span
                      key={index}
                      style={{
                        color: "#868e96",
                        fontSize: "0.7rem",
                      }}
                    >
                      {result.description}
                    </span>
                  </div>
                </Link>
                {index !== promotion.results.length - 1 && (
                  <span
                    style={{
                      textAlign: "center",
                      fontSize: "18px",
                      fontWeight: "900",
                      color: "#f59f00",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("or")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
        <Button
          variant="primary"
          size="lg"
          style={{ border: "none", margin: "auto 0 0 auto", width: "50%" }}
          href={`/products/${promotion.conditions[0].condition_type_code}`}
        >
          {t("view_details")}
        </Button>
      </div>
    </>
  );
};

export default PromotionContainer;
