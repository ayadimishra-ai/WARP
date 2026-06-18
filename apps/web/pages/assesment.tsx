import { Flex, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { GetServerSideProps, NextPage } from "next";
import { useEffect } from "react";

const Assesment: NextPage = (props) => {
  // console.log({ props });

  let isPlatformAndTokenAvailable: any = props;
  useEffect(() => {
    try {
      if (isPlatformAndTokenAvailable.userAccessDetails.length > 0) {
        localStorage.setItem(
          "warp_user_access_token",
          isPlatformAndTokenAvailable.userAccessDetails[0].warpUserAccessToken
        );
      } else {
        localStorage.setItem("warp_user_access_token", "");
      }
    } catch (error) {
      console.log("WARP : Error", "Pages>Assesment", error);
    }
  });

  if (isPlatformAndTokenAvailable.userAccessDetails.length > 0) {
    return <div>Singed in</div>;
  } else {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ height: "95vh" }}
      >
        <Stack
          spacing="md"
          align="center"
          p={40}
          style={{
            marginTop: "-2em",
            background: "#FFE1D3",
            borderRadius: 10,
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <IconAlertCircle size="4.5rem" color="#AC0B0B" />
          <Title order={4} weight={600} color="#AC0B0B">
            Session Expired
          </Title>

          <Text size="md" mb="md">
            Your session has expired. Please log in again to continue.
          </Text>
        </Stack>
      </Flex>
    );
  }
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return embeddedAuthGuard(context);
};

export default Assesment;
