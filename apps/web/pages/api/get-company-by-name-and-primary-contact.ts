import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { Company_Bool_Exp } from "@warp/graphql/generated/types";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.query?.companyName || !req?.query?.primaryContactEmail) {
    res.status(400).send("Company name and primary contact email is required");
    return;
  }

  let where: Company_Bool_Exp;
  if (req?.query?.primaryContactPhone != "") {
    const companyName: any = req?.query?.companyName;
    const primaryContactEmail: any = req?.query?.primaryContactEmail;
    const primaryContactPhone: any = req?.query?.primaryContactPhone;
    where = {
      _or: [
        { name: { _ilike: companyName } },
        { primaryContact: { _contains: { email: primaryContactEmail } } },
        { primaryContact: { _contains: { phone: primaryContactPhone } } },
      ],
    };
  } else {
    const companyName: any = req?.query?.companyName;
    const primaryContactEmail: any = req?.query?.primaryContactEmail;

    where = {
      _or: [
        { name: { _ilike: companyName } },
        {
          primaryContact: {
            _contains: { email: primaryContactEmail },
          },
        },
      ],
    };
  }

  const responce = await sdk.GetCompanyByName({ where });

  res.status(200).send({ data: responce, error: null });

  return;
}

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true,
});

export const dynamic = "force-dynamic";
