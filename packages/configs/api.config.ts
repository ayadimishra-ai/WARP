export const getGraphqlApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  console.log("GraphQL API URL:", url);
  return process.env.NEXT_PUBLIC_GRAPHQL_API_URL ?? "https://2bcfdg2um2.ap-south-1.awsapprunner.com/v1/graphql";

};

export const getAppApiUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL;
