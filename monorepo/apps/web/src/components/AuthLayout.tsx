import { Box, Text, Image as MantineImage } from "@mantine/core";
import { ReactNode } from "react";
import Logo from "./Logo";

interface AuthLayoutProps {
  children: ReactNode;
  rightImage: string;
  rightTitle: string;
  rightDescription: string;
  heading?: string;
  subheading?: string;
  showLogo?: boolean;
}

export default function AuthLayout({
  children,
  rightImage,
  rightTitle,
  rightDescription,
  heading = "Sign in",
  subheading = "Let's navigate your journey to Net Zero",
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <Box
      className="sign-in-flex-container"
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Left Side */}
      <Box
        className="sign-in-left-col"
        style={{
          flex: 0.7,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0px 32px 0px 32px",
          maxWidth: "none",
        }}
      >
        <Box w={320}>
          {showLogo && <Logo />}
          <Text c="#444444" size="24px" fw={300} ta="center" my={24}>
            {heading}
          </Text>
          <Text c="#444444" size="14px" ta="center" mb={32} fw={400}>
            {subheading}
          </Text>
          {children}
        </Box>
      </Box>
      {/* Right Side */}
      <Box
        className="sign-in-right-col"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F9FA",
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
          overflow: "hidden",
          minHeight: 320,
        }}
      >
        <Box
          style={{
            position: "relative",
            width: "90%",
            height: "95vh",
            borderRadius: 32,
            overflow: "hidden",
            boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          }}
        >
          <MantineImage
            src={rightImage}
            alt="Auth visual"
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            radius={32}
            h="100%"
            w="100%"
          />
          <Box
            style={{
              position: "absolute",
              width:"90%",
              left: 0,
              right: 0,
              bottom: 0,
              color: "#fff",
              padding: "90px 100px 50px 48px",
              background: "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 50%)",
            }}
          >
            <Text fz={20} fw={400} c="#fff" fs="italic">
              {rightTitle}
            </Text>
            <Text fz={13} fw={300} c="#fff" mt={20}>
              {rightDescription}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
