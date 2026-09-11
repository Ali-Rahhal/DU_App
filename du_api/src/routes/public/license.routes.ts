import { Hono } from "hono";
import { checkLicense, COMPANY_IDS } from "../../lib/licenseService";
const router = new Hono();

router.get(`/companies`, async (c) => {
  const results = await Promise.all(
    COMPANY_IDS.map(async (companyId) => {
      const license = await checkLicense(companyId);

      return {
        id: companyId,
        licensed: license.valid,
      };
    }),
  );

  return c.json({
    companies: results
      .filter((company) => company.licensed)
      .map((company) => company.id),
  });
});

export default router;
