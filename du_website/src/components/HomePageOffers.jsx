import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

const HomePageOffers = ({ offers }) => {
  const t = useTranslations();

  return (
    <section className="homepage-offers">
      <div className="container">
        <div className="offers-grid">
          {offers?.map((item, index) => (
            <div className="offer-card" key={index + item.image}>
              <div className="offer-image">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                />
              </div>

              <div className="offer-info">
                <h2 className="offer-title">{item.title}</h2>

                <p className="offer-subtitle">{item.subTitle}</p>

                <Link href={item.url || ""} className="btn btn-primary btn-sm">
                  {t("shop_now")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageOffers;
