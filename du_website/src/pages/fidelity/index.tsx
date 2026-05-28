import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import {
  getFidelityPoints,
  getFidelityGifts,
  getMilestoneRewards,
  redeemGift,
} from "@/utils/apiCalls";
import { Button, Spinner, ProgressBar, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

/* ================= TYPES ================= */

type Ledger = {
  fidelity_points_ledger_id: string;
  points_earned: number;
  points_redeemed: number;
  description: string;
  created_at: string;
};

type UserReward = {
  fidelity_user_reward_id: string;
  reward_name: string;
  reward_type: string;
  required_points: number;
  discount_percentage?: number;
  fixed_discount_amount?: number;
  granted_at: string;
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

/* ================= PAGE ================= */

const FidelityPage = () => {
  const [loading, setLoading] = useState(true);
  const t = useTranslations();
  const [points, setPoints] = useState({
    totalEarned: 0,
    totalRedeemed: 0,
    availablePoints: 0,
  });

  const [ledger, setLedger] = useState<Ledger[]>([]);

  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [milestoneRewards, setMilestoneRewards] = useState<MilestoneReward[]>(
    [],
  );

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [giftSkip, setGiftSkip] = useState(0);
  const [hasMoreGifts, setHasMoreGifts] = useState(true);

  const [redeeming, setRedeeming] = useState<string | null>(null);

  /* ================= LOAD POINTS ================= */

  const loadPoints = async () => {
    const res = await getFidelityPoints();

    setPoints({
      totalEarned: res.data.result.totalEarned,
      totalRedeemed: res.data.result.totalRedeemed,
      availablePoints: res.data.result.availablePoints,
    });

    setLedger(res.data.result.ledger || []);
    setUserRewards(res.data.result.rewards || []);
  };

  /* ================= LOAD MILESTONES ================= */

  const loadMilestones = async () => {
    const res = await getMilestoneRewards();
    setMilestoneRewards(res.data.result || []);
  };

  /* ================= LOAD GIFTS (PAGINATION) ================= */

  const loadGifts = async (reset = false) => {
    const skip = reset ? 0 : giftSkip;

    const res = await getFidelityGifts(skip, PAGE_SIZE);

    const newItems = res.data.result.items;

    setGifts((prev) => (reset ? newItems : [...prev, ...newItems]));
    setGiftSkip(skip + PAGE_SIZE);
    setHasMoreGifts(res.data.result.hasMore);
  };

  /* ================= INIT ================= */

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPoints(), loadMilestones(), loadGifts(true)]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= NEXT REWARD ================= */

  const nextReward = useMemo(() => {
    if (!milestoneRewards.length) return null;

    const sorted = [...milestoneRewards].sort(
      (a, b) => a.required_points - b.required_points,
    );

    return sorted.find((r) => r.required_points > points.totalEarned) || null;
  }, [milestoneRewards, points.totalEarned]);

  /* ================= ROADMAP ================= */

  const rewardRoadmap = useMemo(() => {
    return milestoneRewards
      .slice()
      .sort((a, b) => a.required_points - b.required_points)
      .map((r) => ({
        ...r,
        unlocked: r.required_points <= points.totalEarned,
      }));
  }, [milestoneRewards, points.totalEarned]);

  /* ================= PROGRESS ================= */

  const progress = useMemo(() => {
    if (!nextReward) return 100;

    const prev = milestoneRewards
      .filter((r) => r.required_points <= points.totalEarned)
      .slice(-1)[0];

    const start = prev?.required_points || 0;
    const end = nextReward.required_points;

    return Math.min(100, ((points.totalEarned - start) / (end - start)) * 100);
  }, [nextReward, milestoneRewards, points.totalEarned]);

  /* ================= REDEEM ================= */

  const handleRedeem = async (giftId: string) => {
    try {
      setRedeeming(giftId);
      await redeemGift(giftId);
      toast.success("Gift redeemed successfully");

      await Promise.all([loadPoints(), loadGifts(true)]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Redeem failed");
    } finally {
      setRedeeming(null);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        {/* HEADER */}
        <div className="mb-4">
          <h2>{t("fidelity.fid_program")}</h2>
          <p className="text-muted">{t("fidelity.fid_program_discription")}</p>
        </div>

        {/* POINTS */}
        <Card className="p-3 mb-4">
          <div className="d-flex justify-content-between flex-wrap">
            <div>
              <h6>{t("fidelity.total_Earned")}</h6>
              <h4>{points.totalEarned}</h4>
            </div>

            <div>
              <h6>{t("fidelity.redeemed")}</h6>
              <h4>{points.totalRedeemed}</h4>
            </div>

            <div>
              <h6>{t("fidelity.available")}</h6>
              <h4 className="text-success">{points.availablePoints}</h4>
            </div>
          </div>
        </Card>

        {/* NEXT REWARD */}
        <Card
          className="p-4 mb-4 border-0 shadow-sm"
          style={{
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(25,135,84,0.08), rgba(13,110,253,0.05))",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h4 className="mb-1 fw-bold">{t("fidelity.next_reward")}</h4>

              <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                {t("fidelity.next_reward_discription")}
              </p>
            </div>

            <div
              style={{
                background: "#198754",
                color: "white",
                padding: "8px 16px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {points.availablePoints} {t("fidelity.points")}
            </div>
          </div>

          {nextReward ? (
            <>
              <div className="mb-2 d-flex justify-content-between">
                <span className="fw-semibold">{nextReward.name}</span>

                <span className="text-muted">
                  {points.availablePoints} / {nextReward.required_points}
                </span>
              </div>

              <ProgressBar
                now={progress}
                style={{
                  height: 14,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
                className="mb-3"
              />

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <small className="text-muted">
                  {nextReward.required_points - points.availablePoints}{" "}
                  {t("fidelity.more_points_needed")}
                </small>

                <div
                  style={{
                    background: "rgba(13,110,253,0.1)",
                    color: "#0d6efd",
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {t("fidelity.upcoming_reward")}
                </div>
              </div>
            </>
          ) : (
            <div
              className="text-center py-3"
              style={{
                background: "rgba(25,135,84,0.08)",
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: 42 }}>🎉</div>

              <h5 className="fw-bold text-success">
                {t("fidelity.all_rewards_unlocked")}
              </h5>

              <p className="text-muted mb-0">
                {t("fidelity.all_rewards_unlocked_description")}
              </p>
            </div>
          )}
        </Card>

        {/* ROADMAP */}
        <Card
          className="p-4 mb-4 border-0 shadow-sm"
          style={{
            borderRadius: 20,
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h4 className="fw-bold mb-1">{t("fidelity.reward_roadmap")}</h4>

              <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                {t("fidelity.reward_roadmap_discription")}
              </p>
            </div>

            <div
              style={{
                background: "#f8f9fa",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {rewardRoadmap.filter((r) => r.unlocked).length}/
              {rewardRoadmap.length} {t("fidelity.unlocked")}
            </div>
          </div>

          {rewardRoadmap.length === 0 ? (
            <div
              className="text-center py-5"
              style={{
                background: "#f8f9fa",
                borderRadius: 16,
              }}
            >
              <h6 className="text-muted mb-0">{t("fidelity.no_milestones")}</h6>
            </div>
          ) : (
            <div className="position-relative">
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: "#e9ecef",
                  borderRadius: 10,
                }}
              />

              <div className="d-flex flex-column gap-3">
                {rewardRoadmap.map((r, index) => {
                  const isCurrent =
                    nextReward &&
                    nextReward.fidelity_reward_rule_id ===
                      r.fidelity_reward_rule_id;

                  return (
                    <div
                      key={r.fidelity_reward_rule_id}
                      className="position-relative d-flex gap-3"
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          minWidth: 34,
                          borderRadius: "50%",
                          background: r.unlocked ? "#198754" : "#dee2e6",
                          border: "4px solid white",
                          boxShadow: "0 0 0 2px #e9ecef",
                          zIndex: 2,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "white",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {r.unlocked ? "✓" : index + 1}
                      </div>

                      <div
                        className="flex-grow-1"
                        style={{
                          borderRadius: 18,
                          padding: 18,
                          background: r.unlocked
                            ? "rgba(25,135,84,0.08)"
                            : "#f8f9fa",
                          border: isCurrent
                            ? "2px solid #0d6efd"
                            : "1px solid #ececec",
                          transition: "0.2s",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                          <div>
                            <h5 className="fw-bold mb-1">{r.name}</h5>

                            <div
                              className="text-muted"
                              style={{ fontSize: 14 }}
                            >
                              {t("fidelity.unlocks_at")} {r.required_points}{" "}
                              {t("fidelity.points")}
                            </div>
                          </div>

                          <div className="d-flex gap-2 flex-wrap">
                            {r.unlocked && (
                              <div
                                style={{
                                  background: "#198754",
                                  color: "white",
                                  padding: "6px 12px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {t("fidelity.unlocked").toUpperCase()}
                              </div>
                            )}

                            {isCurrent && (
                              <div
                                style={{
                                  background: "#0d6efd",
                                  color: "white",
                                  padding: "6px 12px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {t("fidelity.next_target").toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          {r.reward_type === "percentage_discount" && (
                            <small className="text-muted">
                              {t("fidelity.percentage_discount_reward")}
                            </small>
                          )}

                          {r.reward_type === "fixed_discount" && (
                            <small className="text-muted">
                              {t("fidelity.fixed_discount_reward")}
                            </small>
                          )}

                          {!r.reward_type && (
                            <small className="text-muted">
                              {t("fidelity.loyalty_milestone_reward")}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* GIFTS */}
        <Card className="p-3 mb-4">
          <h5>{t("fidelity.redeem_gifts")}</h5>

          <div className="row">
            {gifts.map((g) => (
              <div key={g.fidelity_gift_id} className="col-6 col-md-4 mb-3">
                <Card className="p-2 h-100">
                  <img
                    src={
                      g.image ||
                      process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
                    }
                    className="img-fluid mb-2"
                    onError={(e) => {
                      e.currentTarget.src =
                        process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE;
                    }}
                  />

                  <h6>{g.name}</h6>

                  <small>
                    {g.required_points} {t("fidelity.points")}
                  </small>

                  <Button
                    size="sm"
                    className="mt-2"
                    disabled={
                      redeeming === g.fidelity_gift_id ||
                      points.availablePoints < g.required_points
                    }
                    onClick={() => handleRedeem(g.fidelity_gift_id)}
                  >
                    {redeeming === g.fidelity_gift_id
                      ? "..."
                      : t("fidelity.redeem")}
                  </Button>
                </Card>
              </div>
            ))}
          </div>

          {hasMoreGifts && (
            <div className="text-center mt-2">
              <Button onClick={() => loadGifts(false)}>
                {t("fidelity.load_more")}
              </Button>
            </div>
          )}
        </Card>

        {/* HISTORY */}
        <Card className="p-3 border-0 shadow-sm" style={{ borderRadius: 20 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold mb-1">{t("fidelity.points_history")}</h4>

              <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                {t("fidelity.points_history_discription")}
              </p>
            </div>

            <div
              style={{
                background: "#f8f9fa",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {ledger.length} {t("fidelity.records")}
            </div>
          </div>

          {ledger.length === 0 ? (
            <div
              className="text-center py-5"
              style={{
                background: "#f8f9fa",
                borderRadius: 16,
              }}
            >
              <h6 className="text-muted mb-1">
                {t("fidelity.no_points_history")}
              </h6>

              <small className="text-muted">
                {t("fidelity.points_history_empty_description")}
              </small>
            </div>
          ) : (
            <div
              style={{
                maxHeight: ledger.length > 6 ? 520 : "unset",
                overflowY: ledger.length > 6 ? "auto" : "visible",
                paddingRight: 4,
              }}
            >
              {ledger.map((l) => {
                const earned = l.points_earned > 0;

                return (
                  <div
                    key={l.fidelity_points_ledger_id}
                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                  >
                    <div className="d-flex gap-3 align-items-start">
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          minWidth: 42,
                          borderRadius: "50%",
                          background: earned
                            ? "rgba(25,135,84,0.12)"
                            : "rgba(220,53,69,0.12)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 18,
                        }}
                      >
                        {earned ? "⬆️" : "🎁"}
                      </div>

                      <div>
                        <div className="fw-semibold">{l.description}</div>

                        <small className="text-muted">
                          {new Date(l.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>

                    <div className="text-end">
                      {l.points_earned > 0 && (
                        <div
                          className="fw-bold"
                          style={{
                            color: "#198754",
                            fontSize: 17,
                          }}
                        >
                          +{l.points_earned}
                        </div>
                      )}

                      {l.points_redeemed > 0 && (
                        <div
                          className="fw-bold"
                          style={{
                            color: "#dc3545",
                            fontSize: 17,
                          }}
                        >
                          -{l.points_redeemed}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default FidelityPage;
