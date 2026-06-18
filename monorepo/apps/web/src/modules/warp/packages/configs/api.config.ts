export const getGraphqlApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  if (!url || url === "undefined" || url === "null") {
    const fallback =
      "https://2bcfdg2um2.ap-south-1.awsapprunner.com/v1/graphql";
    // console.log(`[api.config] Using fallback GraphQL URL: ${fallback}`);
    return fallback;
  }
  return url;
};
 
export const getAppApiUrl = () => {
  // const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  let url: any = null;
  if (!!process.env.NEXT_PUBLIC_API_BASE_URL)
    url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url || url === "undefined" || url === "null") {
    const fallback = "https://smppthkqwy.ap-south-1.awsapprunner.com/warp";
    // console.log(`[api.config] Using fallback App API URL: ${fallback}`);
    return fallback;
  }
  return url;
};
