import { getPrisma } from "../lib/prisma";
import * as jwt from "jsonwebtoken";
const tokenAuth = async (Bearertoken: string, companyId: string) => {
  const prisma = getPrisma(companyId);
  try {
    const payload: any = jwt.verify(
      Bearertoken,
      process.env.JWT_SECRET as string,
    );

    const user = await prisma.web_accounts.findFirst({
      where: {
        id: payload.userId,
      },
      select: { id: true, token_version: true },
    });
    if (!user || user.token_version !== payload.tokenVersion) {
      return null; // token has been invalidated
    }
    return user.id;
  } catch (e) {
    return null;
  }
};
export default tokenAuth;
