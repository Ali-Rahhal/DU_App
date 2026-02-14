import {
  Prisma,
  promotion,
  promotion_condition,
  promotion_result,
} from "@prisma/client";
import prisma from "../lib/prisma";
import { getItemsDetail } from "./EcomController";

const getAllAvailablePromotions = async () => {
  // Fetch active promotions
  const activePromotions: promotion[] = await prisma.$queryRaw`SELECT * 
     FROM promotion p 
     WHERE p.start_date  <= getdate()
        AND p.end_date >= getdate()
        AND p.is_active = 1
        AND p.promotion_type = 5
        `;

  // Log active promotion IDs

  if (activePromotions.length === 0) {
    return []; // Return empty results if no active promotions
  }

  // Create values for the WITH clause
  const promotionValues = activePromotions
    .map((p) => `(${p.promotion_id})`)
    .join(",");

  // Fetch promotion conditions
  const promotionConds: any[] = await prisma.$queryRawUnsafe(
    `WITH promotionActive AS (
       SELECT * FROM (VALUES ${promotionValues}) AS p(promotion_id)
     )
     SELECT  pc.*,
     item_description = (SELECT description FROM dbo.item WHERE item_code = pc.condition_type_code),
    ISNULL(
    (
      SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
      FROM dbo.image AS img
      WHERE img.owner_code = pc.condition_type_code
       AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
    ), N''
  ) as images
     FROM promotionActive p
     JOIN promotion_condition pc ON p.promotion_id = pc.promotion_id
     where pc.is_active = 1
     and pc.condition_type = 1
     `,
  );

  // Fetch promotion results
  const promotionResults: any[] = await prisma.$queryRawUnsafe(
    `WITH promotionActive AS (
       SELECT * FROM (VALUES ${promotionValues}) AS p(promotion_id)
     )
     SELECT  pr.*,    
       item_description = (SELECT description FROM dbo.item WHERE item_code = pr.result_type_code),
  ISNULL(
    (
      SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
      FROM dbo.image AS img
      WHERE img.owner_code = pr.result_type_code
       AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
    ), N''
  ) as images
     FROM promotionActive p
     JOIN promotion_result pr ON p.promotion_id = pr.promotion_id
     where pr.is_active = 1
     and pr.result_type = 1
     `,
  );

  const conditions = promotionConds.map((pc) => {
    return {
      ...pc,
      images: pc.images.split(","),
    };
  });
  const results = promotionResults.map((pr) => {
    return {
      ...pr,
      images: pr.images.split(","),
    };
  });

  const groupedPromotions = activePromotions.map((p) => {
    const selectedCond = conditions.filter(
      (pc) => pc.promotion_id === p.promotion_id,
    );
    const selectedRes = results.filter(
      (pr) => pr.promotion_id === p.promotion_id,
    );

    return {
      ...p,
      conditions: selectedCond,
      results: selectedRes,
    };
  });
  return groupedPromotions.filter((p) => p.conditions.length > 0);
};

const getProductPromotions = async (
  item_code: string,
  user_id: number | null,
) => {
  const res: any = await prisma.$queryRaw`
SELECT DISTINCT
       name = p.description,
       pc.condition_type_code,
       promotion_id = p.promotion_id,
       condition_description = (pc.description),
       result_description = (pr.description)
FROM dbo.promotion p
    INNER JOIN dbo.promotion_header AS ph
        ON ph.promotion_id = p.promotion_id
    INNER JOIN dbo.promotion_condition AS pc
        ON pc.promotion_header_id = ph.promotion_header_id
    INNER JOIN dbo.promotion_result AS pr
        ON pr.promotion_header_id = ph.promotion_header_id
WHERE pc.condition_type = 1
      AND pc.condition_type_code = ${item_code}
      AND CONVERT(DATE, p.start_date) <= CONVERT(DATE, GETDATE())
      AND CONVERT(DATE, p.end_date) >= CONVERT(DATE, GETDATE())
      AND p.is_active = 1
      AND pc.is_active = 1
      AND pr.is_active = 1
GROUP BY p.description,
         pc.condition_type_code,
         pc.description,
         pr.description,
         p.promotion_id;
  `;

  const groupedResults: {
    name: string;
    promotion_id: number;
    promotions: {
      condition_description: string;
      result_description: string;
    }[];
  }[] = [];

  res.forEach((item) => {
    const found = groupedResults.find(
      (i) => i.promotion_id === item.promotion_id,
    );
    if (!found) {
      groupedResults.push({
        name: item.name,
        promotion_id: item.promotion_id,
        promotions: [
          {
            condition_description: item.condition_description,
            result_description: item.result_description,
          },
        ],
      });
    } else {
      found.promotions.push({
        condition_description: item.condition_description,
        result_description: item.result_description,
      });
    }
  });

  return groupedResults;
};

const getShoppingCartPromotions = async (user_id: number) => {
  const res: any[] = await prisma.$queryRaw`
  DECLARE @account_id INT = ${user_id};

WITH RankedPromotions
AS (SELECT p.promotion_id,
           p.description,
           sc.item_code,
           sc.quantity,
           pc.condition_type_code AS buy_item_condition,
           pc.amount AS buy_quantity_condition,
           pr.result_type_code AS get_item_result,
           pr.action_value AS get_quantity_result,
           CASE
               WHEN pc.conversion_strategy = 2 THEN
                   CONVERT(INT, pr.action_value * CONVERT(INT, (sc.quantity / CONVERT(INT, pc.amount))))
               ELSE
                   CONVERT(INT, pr.action_value)
           END AS result_quantity,
           ROW_NUMBER() OVER (PARTITION BY p.promotion_id, sc.item_code ORDER BY pc.amount DESC) AS rn
    FROM dbo.promotion AS p
        INNER JOIN dbo.promotion_header AS ph
            ON ph.promotion_id = p.promotion_id
        INNER JOIN dbo.promotion_condition AS pc
            ON pc.promotion_header_id = ph.promotion_header_id
        INNER JOIN dbo.promotion_result AS pr
            ON pr.promotion_header_id = ph.promotion_header_id
        INNER JOIN dbo.shopping_cart AS sc
            ON sc.item_code = pc.condition_type_code
    WHERE p.is_active = 1
          AND p.promotion_type = 5
          AND CONVERT(DATE, GETDATE())
          BETWEEN CONVERT(DATE, p.start_date) AND CONVERT(DATE, p.end_date)
          AND ph.is_active = 1
          AND pc.is_active = 1
          AND pr.is_active = 1
          AND pc.condition_type = 1
          AND pc.amount_type = 1
          AND sc.quantity >= ISNULL(pc.amount_range_start, 0)
          AND pr.result_type = 1
          AND pr.result_amount_type = 1
          AND sc.account_id = @account_id
          AND sc.is_active = 1
          AND sc.status = 5
          AND sc.quantity >= pc.amount)
SELECT promotion_id,
       description,
       item_code,
       quantity,
       buy_item_condition,
       buy_quantity_condition,
       get_item_result,
       get_quantity_result,
       result_quantity
FROM RankedPromotions
WHERE rn = 1;
`;
  const promotion_ids = res.map((p) => p.promotion_id);

  if (promotion_ids.length === 0) {
    return [];
  }
  const promotionDetails = await getPromotionDetails(promotion_ids);
  const items = await getItemsDetail(res.map((p) => p.item_code));
  const addedItems = items.products.map((item) => {
    const found = res.find((i) => i.item_code === item.item_code);
    return {
      ...item,
      quantity: parseInt(found?.get_quantity_result),
    };
  });
  return {
    promotionDetails,
    promotionResults: res,
    addedItems,
  };
};

const getPromotionDetails = async (promotion_ids: number[]) => {
  const res: any = await prisma.$queryRaw`
  SELECT DISTINCT
         name = p.description,
         promotion_id = p.promotion_id,
         pc.condition_type_code,
         condition_description = (pc.description),
         result_description = (pr.description)
  FROM dbo.promotion p
      INNER JOIN dbo.promotion_header AS ph
          ON ph.promotion_id = p.promotion_id
      INNER JOIN dbo.promotion_condition AS pc
          ON pc.promotion_header_id = ph.promotion_header_id
      INNER JOIN dbo.promotion_result AS pr
          ON pr.promotion_header_id = ph.promotion_header_id
  WHERE pc.condition_type = 1        
        AND p.promotion_id IN (${Prisma.join(promotion_ids)})
        AND p.is_active = 1
    AND pc.is_active = 1
      AND pr.is_active = 1
  GROUP BY p.description,
           pc.condition_type_code,
           pc.description,
           pr.description,
            p.promotion_id;`;

  const groupedResults: {
    name: string;
    promotion_id: number;
    promotions: {
      condition_description: string;
      result_description: string;
    }[];
  }[] = [];
  res.forEach((item) => {
    const found = groupedResults.find(
      (i) => i.promotion_id === item.promotion_id,
    );
    if (!found) {
      groupedResults.push({
        name: item.name,
        promotion_id: item.promotion_id,
        promotions: [
          {
            condition_description: item.condition_description,
            result_description: item.result_description,
          },
        ],
      });
    } else {
      found.promotions.push({
        condition_description: item.condition_description,
        result_description: item.result_description,
      });
    }
  });

  return groupedResults;
};

export {
  getAllAvailablePromotions,
  getShoppingCartPromotions,
  getProductPromotions,
};
