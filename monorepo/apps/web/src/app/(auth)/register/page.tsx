"use client";

import { useState, useRef, useEffect } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Group,
  Text,
  Stack,
  Anchor,
  Modal,
  Box,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import AuthLayout from "@/components/AuthLayout";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    company: z.string().min(2, "Company name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function maskValue(value: string, type: "email" | "mobile") {
  if (type === "email") {
    const [user, domain] = value.split("@");
    if (!user || !domain) return value;
    return `${user.slice(0, 2)}${"#".repeat(
      Math.max(0, user.length - 2)
    )}@${domain}`;
  } else {
    return value.replace(/(\d{2})\d{6}(\d{2})/, "$1######$2");
  }
}

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpType, setOtpType] = useState<"email" | "mobile" | null>(null);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      company: "",
      password: "",
      confirmPassword: "",
    },
    validate: zodResolver(schema),
    validateInputOnChange: true,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (otpModalOpen && resendDisabled) {
      setTimer(60);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpModalOpen, resendDisabled]);

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      notifications.show({
        title: "Success",
        message: "Registered successfully!",
        color: "green",
      });
      setLoading(false);
      router.push("/signin");
    }, 1000);
  };

  const handleOtpClick = (type: "email" | "mobile") => {
    setOtpType(type);
    setOtpValues(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpModalOpen(true);
    setResendDisabled(true);
  };

  const handleOtpInput = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[idx] = value;
    setOtpValues(newValues);
    setOtpError("");
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpValues[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("Text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtpValues(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpVerify = () => {
    if (otpValues.some((v) => v === "")) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }
    setOtpModalOpen(false);
    if (otpType === "email") setEmailVerified(true);
    if (otpType === "mobile") setMobileVerified(true);
    notifications.show({
      title: "Verified",
      message: `${otpType === "email" ? "Email" : "Mobile number"} verified!`,
      color: "green",
    });
  };

  const handleResendOtp = () => {
    setOtpValues(["", "", "", "", "", ""]);
    setOtpError("");
    setResendDisabled(true);
    setTimer(60);
    // Simulate resend OTP
    notifications.show({
      title: "OTP Sent",
      message: `A new OTP has been sent to your ${
        otpType === "email" ? "email" : "mobile number"
      }.`,
      color: "blue",
    });
  };

  return (
    <>
      <Modal
        opened={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        title="OTP Verification"
        size={474}
        centered
      >
        <Group gap={20}>
          <Text fz={14} c="#444444" lh="16px">
            OTP sent successfully! A six digit OTP is sent on your{" "}
            {otpType === "email" ? "email" : "mobile number"}{" "}
            <b>
              {maskValue(form.values[otpType ?? "email"], otpType ?? "email")}
            </b>
          </Text>
          <Stack w="100%">
            <Group justify="space-between">
              {otpValues.map((v, i) => (
                <TextInput
                  key={i}
                  value={v}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  ref={(el) => {
                    otpRefs.current[i] = el || null;
                  }}
                  maxLength={1}
                  size="lg"
                  w={48}
                  h={48}
                  fz={30}
                  ta="center"
                  autoFocus={i === 0}
                  type="text"
                  inputMode="numeric"
                />
              ))}
            </Group>
            {otpError && <Text c="red">{otpError}</Text>}
          </Stack>
          <Group gap={8}>
            <Text
              c="#F2994A"
              fw={500}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              00:{timer.toString().padStart(2, "0")}
            </Text>
            <Button
              variant="white"
              size="xs"
              px={0}
              disabled={resendDisabled}
              onClick={handleResendOtp}
              style={{
                color: resendDisabled ? "#BDBDBD" : "#0B3C5D",
              }}
              bg="#fff"
            >
              Resend OTP
            </Button>
          </Group>
        </Group>
        <Group gap={24} mt={24}>
          <Button variant="outline" onClick={() => setOtpModalOpen(false)}>
            CANCEL
          </Button>
          <Button
            style={{
              background: "linear-gradient(90deg, #0B3C5D 0%, #1E6072 100%)",
            }}
            onClick={handleOtpVerify}
          >
            CONFIRM
          </Button>
        </Group>
      </Modal>
      <AuthLayout
        rightImage="/signin-right.png"
        rightTitle="Nestle Purina and Maersk united for a more sustainable world"
        rightDescription="Find out about the partnership between Nestlé Purina and Maersk, joining forces to revitalize the train as a more sustainable model..."
        heading="Register"
        subheading="Join the Snowkap community today!"
        showLogo={false}
      >
        <BackButton href="/signin" />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={30}>
            <TextInput
              placeholder="Enter Name"
              {...form.getInputProps("name")}
            />
            <Box>
              <TextInput
                placeholder="Enter Email ID"
                {...form.getInputProps("email")}
              />
              <Box pos="absolute">
                {form.errors.email ? (
                  ""
                ) : emailVerified ? (
                  <Text mt={7} c="#2ECC71">
                    Email Verified Successfully
                  </Text>
                ) : form.values.email &&
                  !form.errors.email &&
                  !emailVerified ? (
                  <Text mt={7} c="#F2994A">
                    Verify Email -{" "}
                    <Anchor
                      component="button"
                      type="button"
                      c="#003B52"
                      onClick={() => handleOtpClick("email")}
                    >
                      Click Here
                    </Anchor>
                  </Text>
                ) : null}
              </Box>
            </Box>
            <Box>
              <TextInput
                placeholder="Enter Mobile Number"
                maxLength={10}
                {...form.getInputProps("mobile")}
              />
              <Box pos="absolute">
                {form.errors.mobile ? (
                  ""
                ) : mobileVerified ? (
                  <Text mt={7} c="#2ECC71" className="mantine-TextInput-error">
                    Mobile Number Verified Successfully
                  </Text>
                ) : form.values.mobile &&
                  !form.errors.mobile &&
                  !mobileVerified ? (
                  <Text mt={7} c="#F2994A">
                    Verify Mobile Number -{" "}
                    <Anchor
                      component="button"
                      type="button"
                      c="#003B52"
                      onClick={() => handleOtpClick("mobile")}
                    >
                      Click Here
                    </Anchor>
                  </Text>
                ) : null}
              </Box>
            </Box>
            <TextInput
              placeholder="Enter Company Name"
              {...form.getInputProps("company")}
            />
            <PasswordInput
              placeholder="Enter Password"
              {...form.getInputProps("password")}
            />
            <PasswordInput
              placeholder="Re-enter Password"
              {...form.getInputProps("confirmPassword")}
            />
          </Stack>
          <Group gap={24} mt={25}>
            <Button
              type="submit"
              style={{
                background: "linear-gradient(90deg, #0B3C5D 0%, #1E6072 100%)",
              }}
              loading={loading}
            >
              REGISTER
            </Button>
            <Button variant="outline" component="a" href="#">
              NEED A CALL?
            </Button>
          </Group>
          <Text size="xs" c="dimmed" ta="center" mt={24}>
            By clicking Register, you agree to{" "}
            <Anchor href="#" target="_blank">
              Our Terms
            </Anchor>
          </Text>
          <Text size="xs" c="dimmed" ta="center" mt={32}>
            © 2025 SNOWKAP
          </Text>
        </form>
      </AuthLayout>
    </>
  );
}
