import { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";
import { getItemStock } from "../lib/utils";

export interface AISuggestedProduct {
  item_code: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  stock: number;
}

export interface AISuggestedProductsResponse {
  products: AISuggestedProduct[];

  cashVan: {
    driverName: string | null;
    driverCode: string | null;
    plannedDate: Date | null;
    estimatedArrival: string | null;
  } | null;
}

const getAISuggestedProducts = async (
  userId: number,
  companyId: string,
): Promise<AISuggestedProductsResponse> => {
  const prisma = getPrisma(companyId);
  // =========================
  // GET USER CLIENT CODE
  // =========================

  const user = await prisma.web_accounts.findFirst({
    where: {
      id: userId,
    },
    select: {
      code: true,
    },
  });

  if (!user?.code) {
    throw new Error("Client not found");
  }

  // =========================
  // RANDOM PRODUCTS
  // =========================

  const products: any[] = await prisma.$queryRaw`
    SELECT TOP 20
      it.item_code,
      it.description as name,
      CONVERT(decimal(18,2), ipl.price) as price,

      ISNULL(
        (
          SELECT TOP 1
            img.base_path + '/' +
            img.folder_path + '/' +
            img.physical_file_name
          FROM image img
          WHERE
            img.owner_code = it.item_code
            AND img.owner_type = 1
            AND img.is_active = 1
            AND img.is_uploaded = 1
        ),
        ''
      ) as image,
      ipl.currency_code,
      iu.barcode

    FROM item it

    INNER JOIN item_price_list ipl
      ON ipl.item_code = it.item_code
      AND ipl.is_active = 1

    CROSS APPLY (
        SELECT TOP 1 *
        FROM item_uom iu
        WHERE iu.item_code = it.item_code
          AND iu.is_active = 1
        ORDER BY
          CASE WHEN iu.uom_code = 'P' THEN 0 ELSE 1 END
      ) iu

    WHERE
      it.is_active = 1
      AND it.status = 1

    ORDER BY NEWID()
  `;

  const finalProducts: AISuggestedProduct[] = await Promise.all(
    products.map(async (item) => ({
      item_code: item.item_code,

      name: item.name,

      image: item.image || null,

      price: Number(item.price),

      quantity: Math.floor(Math.random() * 5) + 1,

      stock: await getItemStock(item.item_code),

      currency_code: item.currency_code,

      barcode: item.barcode,
    })),
  );

  // =========================
  // NEXT CASH VAN VISIT
  // =========================

  const nextVisit: any[] = await prisma.$queryRaw`
    SELECT TOP 1
      cr.planned_date,
      r.description
    FROM client_route cr

    INNER JOIN route r
      ON r.route_id = cr.route_id

    WHERE
      cr.client_code = ${user.code}
      AND cr.planned_date >= CAST(GETDATE() AS DATE)

    ORDER BY cr.planned_date ASC
  `;

  let cashVan = null;

  if (nextVisit.length > 0) {
    const visit = nextVisit[0];

    const routeDescription = visit.description || "";

    const driverMatch = routeDescription.match(/\[(.*?)\]/);

    const driverCode = driverMatch ? driverMatch[1] : null;

    const driverName = routeDescription.replace(/\[.*?\]/g, "").trim();

    const visitDate = new Date(visit.planned_date);

    const today = new Date();

    const diffDays = Math.ceil(
      (visitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    cashVan = {
      driverName,
      driverCode,
      plannedDate: visitDate,

      estimatedArrival:
        diffDays <= 0
          ? "Today"
          : `In ${diffDays} day${diffDays > 1 ? "s" : ""}`,
    };
  }

  return {
    products: finalProducts,
    cashVan,
  };
};

export { getAISuggestedProducts };
