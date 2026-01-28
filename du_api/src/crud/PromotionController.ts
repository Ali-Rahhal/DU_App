import {
  promotion,
  promotion_condition,
  promotion_result,
} from "@prisma/client";
import prisma from "../lib/prisma";

const getAllAvailablePromotions = async () => {
  // Fetch active promotions
  const activePromotions: promotion[] = await prisma.$queryRaw`SELECT * 
     FROM promotion p 
     WHERE p.start_date  <= getdate()
        AND p.end_date >= getdate()`;

  // Log active promotion IDs

  if (activePromotions.length === 0) {
    return { promotionConds: [], promotionResults: [] }; // Return empty results if no active promotions
  }

  // Create values for the WITH clause
  const promotionValues = activePromotions
    .map((p) => `(${p.promotion_id})`)
    .join(",");

  // Fetch promotion conditions
  const promotionConds: promotion_condition[] = await prisma.$queryRawUnsafe(
    `WITH promotionActive AS (
       SELECT * FROM (VALUES ${promotionValues}) AS p(promotion_id)
     )
     SELECT  pc.*
     FROM promotionActive p
     JOIN promotion_condition pc ON p.promotion_id = pc.promotion_id`
  );

  // Fetch promotion results
  const promotionResults: promotion_result[] = await prisma.$queryRawUnsafe(
    `WITH promotionActive AS (
       SELECT * FROM (VALUES ${promotionValues}) AS p(promotion_id)
     )
     SELECT  pr.*
     FROM promotionActive p
     JOIN promotion_result pr ON p.promotion_id = pr.promotion_id`
  );

  const groupedPromotions = activePromotions.map((p) => {
    return {
      ...p,
      conditions: promotionConds.filter(
        (pc) => pc.promotion_id === p.promotion_id
      ),
      results: promotionResults.filter(
        (pr) => pr.promotion_id === p.promotion_id
      ),
    };
  });

  return { groupedPromotions };
};

export { getAllAvailablePromotions };
