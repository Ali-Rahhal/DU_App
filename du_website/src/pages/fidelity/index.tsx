import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import {
  getFidelityPoints,
  getFidelityGifts,
  getMilestoneRewards,
  redeemGift,
} from "@/utils/apiCalls";
import { Button, Card, ProgressBar, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Gift,
  History,
  LockKeyhole,
  LucideIcon,
  RefreshCw,
  Star,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";

type Ledger = {
  fidelity_points_ledger_id: string;
  points_earned: number;
  points_redeemed: number;
  description: string;
  created_at: string;
};

type MilestoneReward = {
  fidelity_reward_rule_id: string;
  name: string;
  required_points: number;
  reward_type: string;
};

type Gift = {
  fidelity_gift_id: string;
  name: string;
  required_points: number;
  stock_quantity: number;
  image?: string;
};

const PAGE_SIZE = 6;

const FidelityPage = () => {
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();

  const [loading, setLoading] = useState(true);
  const [loadingMoreGifts, setLoadingMoreGifts] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const [points, setPoints] = useState({
    totalEarned: 0,
    totalRedeemed: 0,
    availablePoints: 0,
  });

  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [milestoneRewards, setMilestoneRewards] = useState<MilestoneReward[]>(
    [],
  );
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [giftSkip, setGiftSkip] = useState(0);
  const [hasMoreGifts, setHasMoreGifts] = useState(true);

  const loadPoints = async () => {
    const { data } = await getFidelityPoints();
    const result = data.result;

    setPoints({
      totalEarned: result.totalEarned,
      totalRedeemed: result.totalRedeemed,
      availablePoints: result.availablePoints,
    });
    setLedger(result.ledger || []);
  };

  const loadMilestones = async () => {
    const { data } = await getMilestoneRewards();
    setMilestoneRewards(data.result || []);
  };

  const loadGifts = async (reset = false) => {
    const skip = reset ? 0 : giftSkip;

    if (!reset) setLoadingMoreGifts(true);

    try {
      const { data } = await getFidelityGifts(skip, PAGE_SIZE);
      const items = data.result.items || [];

      setGifts((prev) => (reset ? items : [...prev, ...items]));
      setGiftSkip(skip + items.length);
      setHasMoreGifts(Boolean(data.result.hasMore));
    } finally {
      setLoadingMoreGifts(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([loadPoints(), loadMilestones(), loadGifts(true)]);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || t("fidelity.failed_to_load_data"),
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const rewardRoadmap = useMemo(
    () =>
      [...milestoneRewards]
        .sort((a, b) => a.required_points - b.required_points)
        .map((reward) => ({
          ...reward,
          unlocked: reward.required_points <= points.totalEarned,
        })),
    [milestoneRewards, points.totalEarned],
  );

  const nextReward = rewardRoadmap.find((reward) => !reward.unlocked) || null;

  const progress = nextReward
    ? Math.min(100, (points.totalEarned / nextReward.required_points) * 100)
    : 100;

  const pointsNeeded = nextReward
    ? Math.max(0, nextReward.required_points - points.totalEarned)
    : 0;

  const unlockedMilestones = rewardRoadmap.filter(
    (reward) => reward.unlocked,
  ).length;

  const handleRedeem = async (giftId: string) => {
    try {
      setRedeeming(giftId);
      await redeemGift(giftId);

      toast.success(t("fidelity.gift_redeemed_successfully"));
      await Promise.all([loadPoints(), loadGifts(true)]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("fidelity.redeem_failed"));
    } finally {
      setRedeeming(null);
    }
  };

  const rewardDescription = (rewardType: string) => {
    if (rewardType === "percentage_discount")
      return t("fidelity.percentage_discount_reward");

    if (rewardType === "fixed_discount")
      return t("fidelity.fixed_discount_reward");

    return t("fidelity.loyalty_milestone_reward");
  };

  const formatDate = (date: string) => new Date(date).toLocaleString();

  if (loading) {
    return (
      <Layout>
        <div className="fidelity-loading">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fidelity-page">
        <section className="fidelity-page-header">
          <div className="fidelity-page-header-content">
            <div className="fidelity-page-header-icon">
              <Gift size={24} />
            </div>

            <div>
              <h1 className="fidelity-page-title">
                {t("fidelity.fid_program")}
              </h1>
              <p className="fidelity-page-subtitle">
                {t("fidelity.fid_program_discription")}
              </p>
            </div>
          </div>
        </section>

        {/* Points */}
        <section className="fidelity-points-grid">
          {[
            ["fidelity.total_Earned", points.totalEarned, Star, "earned"],
            [
              "fidelity.redeemed",
              points.totalRedeemed,
              ArrowDownLeft,
              "redeemed",
            ],
            ["fidelity.available", points.availablePoints, Wallet, "available"],
          ].map(
            ([label, value, Icon, type]: [
              label: string,
              value: number,
              Icon: LucideIcon,
              type: "earned" | "redeemed" | "available",
            ]) => (
              <Card
                key={label as string}
                className={`fidelity-points-card ${
                  type === "available" ? "fidelity-points-card-available" : ""
                }`}
              >
                <div
                  className={`fidelity-points-card-icon fidelity-points-${type}-icon`}
                >
                  <Icon size={20} />
                </div>

                <div className="fidelity-points-card-content">
                  <span className="fidelity-points-label">
                    {t(label as string)}
                  </span>
                  <strong className="fidelity-points-value">
                    {(value as number).toLocaleString()}
                  </strong>
                </div>
              </Card>
            ),
          )}
        </section>

        {/* Next reward */}
        <section className="fidelity-next-reward-card">
          <div className="fidelity-next-reward-top">
            <div className="fidelity-section-heading">
              <div className="fidelity-section-icon fidelity-section-icon-green">
                <Target size={20} />
              </div>

              <div>
                <h2 className="fidelity-section-title">
                  {t("fidelity.next_reward")}
                </h2>
                <p className="fidelity-section-description">
                  {t("fidelity.next_reward_discription")}
                </p>
              </div>
            </div>

            <PointsPill points={points.totalEarned} t={t} />
          </div>

          {nextReward ? (
            <>
              <div className="fidelity-next-reward-details">
                <div>
                  <span className="fidelity-next-reward-label">
                    {t("fidelity.upcoming_reward")}
                  </span>
                  <h3>{nextReward.name}</h3>
                </div>

                <span className="fidelity-next-reward-count">
                  {points.totalEarned.toLocaleString()} /{" "}
                  {nextReward.required_points.toLocaleString()}
                </span>
              </div>

              <ProgressBar now={progress} className="fidelity-progress-bar" />

              <div className="fidelity-progress-footer">
                <span>
                  {pointsNeeded.toLocaleString()}{" "}
                  {t("fidelity.more_points_needed")}
                </span>
                <span className="fidelity-progress-percentage">
                  {Math.round(progress)}%
                </span>
              </div>
            </>
          ) : (
            <div className="fidelity-all-unlocked">
              <div className="fidelity-all-unlocked-icon">
                <Trophy size={24} />
              </div>
              <div>
                <h3>{t("fidelity.all_rewards_unlocked")}</h3>
                <p>{t("fidelity.all_rewards_unlocked_description")}</p>
              </div>
            </div>
          )}
        </section>

        {/* Roadmap */}
        <section className="fidelity-section-card">
          <SectionHeader
            icon={<Trophy size={20} />}
            iconType="blue"
            title={t("fidelity.reward_roadmap")}
            description={t("fidelity.reward_roadmap_discription")}
            right={
              <span className="fidelity-count-pill">
                {unlockedMilestones}/{rewardRoadmap.length}{" "}
                {t("fidelity.unlocked")}
              </span>
            }
          />

          {rewardRoadmap.length === 0 ? (
            <EmptyState
              icon={<Trophy size={25} />}
              text={t("fidelity.no_milestones")}
            />
          ) : (
            <div className="fidelity-roadmap">
              {rewardRoadmap.map((reward, index) => {
                const isCurrent =
                  reward.fidelity_reward_rule_id ===
                  nextReward?.fidelity_reward_rule_id;

                return (
                  <div
                    key={reward.fidelity_reward_rule_id}
                    className={`fidelity-roadmap-item ${
                      reward.unlocked ? "fidelity-roadmap-item-unlocked" : ""
                    } ${isCurrent ? "fidelity-roadmap-item-current" : ""}`}
                  >
                    <div className="fidelity-roadmap-marker">
                      {reward.unlocked ? <Check size={16} /> : index + 1}
                    </div>

                    <div className="fidelity-roadmap-content">
                      <div className="fidelity-roadmap-main">
                        <div className="fidelity-roadmap-reward-icon">
                          {reward.unlocked ? (
                            <Gift size={18} />
                          ) : (
                            <LockKeyhole size={17} />
                          )}
                        </div>

                        <div className="fidelity-roadmap-info">
                          <h3>{reward.name}</h3>
                          <span>
                            {t("fidelity.unlocks_at")}{" "}
                            {reward.required_points.toLocaleString()}{" "}
                            {t("fidelity.points")}
                          </span>
                          <p>{rewardDescription(reward.reward_type)}</p>
                        </div>
                      </div>

                      <div className="fidelity-roadmap-status">
                        {reward.unlocked ? (
                          <StatusBadge
                            type="unlocked"
                            icon={<Check size={13} />}
                          >
                            {t("fidelity.unlocked")}
                          </StatusBadge>
                        ) : isCurrent ? (
                          <StatusBadge
                            type="current"
                            icon={<Target size={13} />}
                          >
                            {t("fidelity.next_target")}
                          </StatusBadge>
                        ) : (
                          <StatusBadge
                            type="locked"
                            icon={<LockKeyhole size={12} />}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Gifts */}
        <section className="fidelity-section-card">
          <SectionHeader
            icon={<Gift size={20} />}
            iconType="green"
            title={t("fidelity.redeem_gifts")}
            description={t("fidelity.use_points_to_redeem")}
            right={<PointsPill points={points.availablePoints} t={t} light />}
          />

          {gifts.length === 0 ? (
            <EmptyState
              icon={<Gift size={25} />}
              text={t("fidelity.redeem_gifts")}
            />
          ) : (
            <div className="fidelity-gifts-grid">
              {gifts.map((gift) => {
                const isRedeeming = redeeming === gift.fidelity_gift_id;
                const outOfStock = gift.stock_quantity <= 0;
                const enoughPoints =
                  points.availablePoints >= gift.required_points;

                return (
                  <Card
                    key={gift.fidelity_gift_id}
                    className="fidelity-gift-card"
                  >
                    <div className="fidelity-gift-image-wrapper">
                      <img
                        src={gift.image || companyPlaceholder}
                        alt={gift.name}
                        className="fidelity-gift-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = companyPlaceholder;
                        }}
                      />

                      {outOfStock && (
                        <span className="fidelity-gift-stock-badge">
                          {t("fidelity.out_of_stock")}
                        </span>
                      )}
                    </div>

                    <div className="fidelity-gift-info">
                      <h3>{gift.name}</h3>

                      <div className="fidelity-gift-cost">
                        <Star size={15} />
                        <strong>{gift.required_points.toLocaleString()}</strong>
                        <span>{t("fidelity.points")}</span>
                      </div>

                      <div className="fidelity-gift-stock">
                        {outOfStock
                          ? t("fidelity.currently_unavailable")
                          : t("fidelity.available_count", {
                              count: gift.stock_quantity,
                            })}
                      </div>

                      <Button
                        className={`fidelity-redeem-button ${
                          !enoughPoints || outOfStock
                            ? "fidelity-redeem-button-disabled"
                            : ""
                        }`}
                        disabled={isRedeeming || !enoughPoints || outOfStock}
                        onClick={() => handleRedeem(gift.fidelity_gift_id)}
                      >
                        {isRedeeming ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            {t("fidelity.redeeming")}
                          </>
                        ) : outOfStock ? (
                          t("fidelity.out_of_stock")
                        ) : !enoughPoints ? (
                          <>
                            <LockKeyhole size={15} />
                            {t("fidelity.redeem")}
                          </>
                        ) : (
                          <>
                            <Gift size={15} />
                            {t("fidelity.redeem")}
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {hasMoreGifts && (
            <div className="fidelity-load-more">
              <Button
                className="fidelity-load-more-button"
                onClick={() => loadGifts()}
                disabled={loadingMoreGifts}
              >
                {loadingMoreGifts ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    {t("fidelity.loading")}
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    {t("fidelity.load_more")}
                  </>
                )}
              </Button>
            </div>
          )}
        </section>

        {/* History */}
        <section className="fidelity-section-card fidelity-history-card">
          <SectionHeader
            icon={<History size={20} />}
            iconType="blue"
            title={t("fidelity.points_history")}
            description={t("fidelity.points_history_discription")}
            right={
              <span className="fidelity-count-pill">
                {ledger.length} {t("fidelity.records")}
              </span>
            }
          />

          {ledger.length === 0 ? (
            <EmptyState
              icon={<History size={25} />}
              text={t("fidelity.no_points_history")}
              description={t("fidelity.points_history_empty_description")}
            />
          ) : (
            <>
              <div className="fidelity-history-table-wrapper">
                <table className="fidelity-history-table">
                  <thead>
                    <tr>
                      <th>{t("fidelity.date")}</th>
                      <th>{t("fidelity.description")}</th>
                      <th>{t("fidelity.type")}</th>
                      <th className="fidelity-history-points-heading">
                        {t("fidelity.points")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {ledger.map((entry) => (
                      <HistoryRow
                        key={entry.fidelity_points_ledger_id}
                        entry={entry}
                        formatDate={formatDate}
                        t={t}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="fidelity-history-mobile">
                {ledger.map((entry) => (
                  <HistoryMobileItem
                    key={entry.fidelity_points_ledger_id}
                    entry={entry}
                    formatDate={formatDate}
                    t={t}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
};

/* Small reusable pieces */

const PointsPill = ({
  points,
  t,
  light = false,
}: {
  points: number;
  t: any;
  light?: boolean;
}) => (
  <div
    className={`fidelity-points-pill ${
      light ? "fidelity-points-pill-light" : ""
    }`}
  >
    <Star size={14} />
    {points.toLocaleString()} {t("fidelity.points")}
  </div>
);

const SectionHeader = ({
  icon,
  iconType,
  title,
  description,
  right,
}: {
  icon: React.ReactNode;
  iconType: "green" | "blue";
  title: string;
  description: string;
  right?: React.ReactNode;
}) => (
  <div className="fidelity-section-card-header">
    <div className="fidelity-section-heading">
      <div
        className={`fidelity-section-icon fidelity-section-icon-${iconType}`}
      >
        {icon}
      </div>
      <div>
        <h2 className="fidelity-section-title">{title}</h2>
        <p className="fidelity-section-description">{description}</p>
      </div>
    </div>
    {right}
  </div>
);

const EmptyState = ({
  icon,
  text,
  description,
}: {
  icon: React.ReactNode;
  text: string;
  description?: string;
}) => (
  <div className="fidelity-empty-state">
    {icon}
    <p>{text}</p>
    {description && <span>{description}</span>}
  </div>
);

const StatusBadge = ({
  type,
  icon,
  children,
}: {
  type: "unlocked" | "current" | "locked";
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <span className={`fidelity-status-badge fidelity-status-${type}`}>
    {icon}
    {children}
  </span>
);

const HistoryRow = ({
  entry,
  formatDate,
  t,
}: {
  entry: Ledger;
  formatDate: (date: string) => string;
  t: any;
}) => {
  const earned = entry.points_earned > 0;

  return (
    <tr>
      <td className="fidelity-history-date">{formatDate(entry.created_at)}</td>
      <td className="fidelity-history-description">{entry.description}</td>
      <td>
        <span
          className={`fidelity-history-type ${
            earned
              ? "fidelity-history-type-earned"
              : "fidelity-history-type-redeemed"
          }`}
        >
          {earned ? <ArrowUpRight size={13} /> : <Gift size={13} />}
          {earned ? t("fidelity.earned") : t("fidelity.redeemed_type")}
        </span>
      </td>
      <td className="fidelity-history-points">
        {entry.points_earned > 0 && (
          <strong className="fidelity-history-earned">
            +{entry.points_earned.toLocaleString()}
          </strong>
        )}
        {entry.points_redeemed > 0 && (
          <strong className="fidelity-history-redeemed">
            -{entry.points_redeemed.toLocaleString()}
          </strong>
        )}
      </td>
    </tr>
  );
};

const HistoryMobileItem = ({
  entry,
  formatDate,
  t,
}: {
  entry: Ledger;
  formatDate: (date: string) => string;
  t: any;
}) => {
  const earned = entry.points_earned > 0;

  return (
    <div className="fidelity-history-mobile-item">
      <div
        className={`fidelity-history-mobile-icon ${
          earned
            ? "fidelity-history-mobile-icon-earned"
            : "fidelity-history-mobile-icon-redeemed"
        }`}
      >
        {earned ? <ArrowUpRight size={18} /> : <Gift size={17} />}
      </div>

      <div className="fidelity-history-mobile-content">
        <div className="fidelity-history-mobile-top">
          <strong>{entry.description}</strong>

          {entry.points_earned > 0 && (
            <span className="fidelity-history-earned">
              +{entry.points_earned.toLocaleString()}
            </span>
          )}

          {entry.points_redeemed > 0 && (
            <span className="fidelity-history-redeemed">
              -{entry.points_redeemed.toLocaleString()}
            </span>
          )}
        </div>

        <div className="fidelity-history-mobile-bottom">
          <span>{formatDate(entry.created_at)}</span>

          <span
            className={`fidelity-history-type ${
              earned
                ? "fidelity-history-type-earned"
                : "fidelity-history-type-redeemed"
            }`}
          >
            {earned ? t("fidelity.earned") : t("fidelity.redeemed_type")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FidelityPage;
