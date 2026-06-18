import { ApolloWrapper } from "~/lib/apollo-provider";
import ComponentAuthGuardWrapper from "~/lib/guards/comp-auth-guard.server";

type TEmbedLayoutProps = {
  params: Promise<{
    organizationId: string;
    accessToken: string;
  }>;
};

const EmbedLayout: React.FC<
  React.PropsWithChildren<TEmbedLayoutProps>
> = async (props) => {
  const params = await props.params;

  if (!params.accessToken) return <div>No access token found</div>;
  if (!params.organizationId) return <div>No organization id found</div>;

  const { accessToken, organizationId } = params;

  return (
    <ComponentAuthGuardWrapper accessToken={accessToken}>
      <ApolloWrapper organizationId={organizationId} accessToken={accessToken}>
        {props.children}
      </ApolloWrapper>
    </ComponentAuthGuardWrapper>
  );
};

export default EmbedLayout;
