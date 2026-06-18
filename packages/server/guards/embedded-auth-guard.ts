import { sdk } from "@warp/graphql/generated/server";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { GetServerSideProps } from "next";

// const IS_PROD = process.env.NODE_ENV === "production";

// const setCookieSameSite = (res: any, value: any) => {
//   const cookies = res.getHeader("Set-Cookie");
//   res.setHeader(
//     "Set-Cookie",
//     cookies?.map((cookie: any) =>
//       cookies.replace(
//         cookie,
//         "SameSite=Lax",
//         `SameSite=${value}; ${IS_PROD ? "Secure;" : ""}`
//       )
//     )
//   );
// };

// export const preview = async (req: any, res: any) => {
//   // ...
//   res.setPreviewData({});
//   setCookieSameSite(res, "None");
//   // ...
// };

export const embeddedAuthGuard: GetServerSideProps = async (context) => {
  try {
    const accessToken = String(context.query.accessToken);
    const decodedToken: any = jwt.decode(accessToken);

    if (!!decodedToken) {
      const session = parseHasuraClaims(decodedToken, accessToken);

      const platformId: any = session?.platform?.id;
      const origin = context.req.headers.referer;

      // console.log({ headers: context.req.headers });

      const results = await sdk.getPlatformApikeyByPlatformIdAndOrigin({
        platformId,
      });

      const platform = results?.Platform[0];

      // console.log({ platform, platformId, origin });

      if (!!platform) {
        const secret = process.env["HASURA_GRAPHQL_JWT_SECRET"] ?? "";
        const varifiedJwtPayload = jwt.verify(accessToken, secret);

        // console.log({ platform, platformId, origin, varifiedJwtPayload });

        if (varifiedJwtPayload) {
          // console.log({ session: JSON.stringify(session) });

          return { props: { session } };
        }
      }
    }
  } catch (e) {
    console.log(e);
  }

  // preview(context.req, context.res);

  return {
    props: { session: null },
  };
};
