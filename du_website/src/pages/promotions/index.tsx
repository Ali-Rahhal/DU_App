import PromotionContainer from "@/components/common/PromotionContainer";
import Layout from "@/components/Layout/Layout";
import { Promotion } from "@/Models/Promotion";
import { getPromotions } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import React from "react";
export async function getServerSideProps() {
  const res: any = await getPromotions();

  return {
    props: {
      promotions: res.data.result,
    },
  };
}

const index = ({ promotions }: { promotions: Promotion[] }) => {
  const t = useTranslations();
  return (
    <>
      <Layout>
        <div className="header_title_con">
          <div className="header_title">{t("promotions")}</div>
          <p className="header_subtitle">
            {/* Check out the latest promotions from our partners */}
            {t("promotion_subtitle")}
          </p>
        </div>
        <div className="promotions_con">
          {promotions?.map((promotion: Promotion) => (
            <PromotionContainer
              promotion={promotion}
              key={promotion.promotion_id}
            />
          ))}
        </div>
      </Layout>
    </>
  );
};

export default index;
