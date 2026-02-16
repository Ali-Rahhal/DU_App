import { getProductPromotion } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const ProductPromotionList = ({
  item_code,
  promotionsArray,
}: {
  item_code?: string;

  promotionsArray?: {
    name: string;
    promotions: {
      condition_description: string;
      result_description: string;
    }[];
  }[];
}) => {
  const t = useTranslations();
  const [promotions, setPromotions] = useState<
    {
      name: string;
      promotions: {
        condition_description: string;
        result_description: string;
      }[];
    }[]
  >([]);
  useEffect(() => {
    if (promotionsArray) {
      setPromotions(promotionsArray);
      return;
    }
    getProductPromotion(item_code).then((res) => {
      setPromotions(res.data.result);
    });
  }, [promotionsArray, item_code]);

  return (
    <div
      className="p-3"
      style={{
        border: "1px solid #f59f00",
        borderRadius: "5px",
        backgroundColor: "rgba(245, 159, 0,0.06)",
      }}
    >
      <h6
        style={{
          color: "#f59f00",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {t("available_promotions")}
      </h6>
      {/* <div className="media align-items-center">
    <span className="mr-2">
      <i className="fa fa-star"></i>
    </span>
    <div className="media-body text-body small">
      <span className="font-weight-bold mr-1">
        Free Shipping
      </span>
    </div>
  </div> */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {promotions.length > 0
          ? promotions.map((promotion, index) => (
              <div
                className="media"
                key={index}
                style={{
                  borderBottom: "1px solid #f1f1f1",
                  padding: "5px 0",
                }}
              >
                <span className="mr-2">
                  <i
                    className="fa fa-star"
                    style={{
                      color: "#f59f00",
                    }}
                  ></i>
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "column",
                    borderBottom: "1px solid #f1f1f1",
                  }}
                >
                  <h6
                    style={{
                      color: "#f59f00",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      fontSize: "16px",
                    }}
                  >
                    {promotion?.name}
                  </h6>
                  {promotion?.promotions?.map((item, index) => (
                    <div
                      className="media-body text-body small"
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexDirection: "column",
                      }}
                    >
                      <span className="font-weight-bold mr-1">
                        <span
                          style={{
                            color: "#f59f00",
                            textTransform: "uppercase",
                          }}
                        >
                          {" "}
                          {t("buy")} <br />
                        </span>{" "}
                        {item.condition_description}
                      </span>
                      <span className="font-weight-bold mr-1">
                        <span
                          style={{
                            color: "green",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("get")} <br />
                        </span>{" "}
                        {item.result_description}
                      </span>
                      {index !== promotion.promotions.length - 1 && (
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
              </div>
            ))
          : null}
      </div>
    </div>
  );
};

export default ProductPromotionList;
