"use client";

import { useState } from "react";
import { TextInput, Button, Text, Stack, Anchor } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import BackButton from "@/components/BackButton";

const forgotSchema = z.object({
  email: z.string().email("Invalid email"),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm({
    initialValues: { email: "" },
    validate: zodResolver(forgotSchema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.message || "Failed to send reset link");
        return;
      }
      setSentEmail(values.email);
      setEmailSent(true);
      setFeedback("");
      form.reset();
    } catch {
      setFeedback("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!sentEmail) return;
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.message || "Failed to resend reset link");
        return;
      }
      notifications.show({
        title: "Reset Link Sent",
        message: data.message || "Check your email for the reset link.",
        color: "green",
      });
      setFeedback("");
    } catch {
      setFeedback("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      rightImage="/signin-right.png"
      rightTitle="Nestle Purina and Maersk united for a more sustainable world"
      rightDescription="Find out about the partnership between Nestlé Purina and Maersk, joining forces to revitalize the train as a more sustainable model..."
      heading={!emailSent ? "Forgot Password?":"Password Reset Email Sent"}
      subheading={!emailSent ? "Enter your registered email to reset password.":""}
    >
      <BackButton href="/signin" />
      {!emailSent ? (
        <>
          <form
            onSubmit={form.onSubmit(handleSubmit)}
          >
            <TextInput
              placeholder="Enter Your Registered Email"
              mb={24}
              data-autofocus
              {...form.getInputProps("email")}
              error={feedback || form.errors.email}
            />
            <Button
              fullWidth
              type="submit"
              style={{
                background: "linear-gradient(90deg, #0B3C5D 0%, #1E6072 100%)",
              }}
              loading={loading}
              disabled={loading}
            >
              SEND RESET LINK
            </Button>
          </form>
        </>
      ) : (
        <Stack>
          <Text c="dimmed" fz={14} ta="center" mb={8}>
            Instructions to reset your password have been sent to{" "}
            <Text span fw={700} c="#0B3C5D">
              {sentEmail}
            </Text>
            .
          </Text>
          <Text c="dimmed" fz={14} ta="center" mb={32}>
            Check your inbox (and spam folder) shortly.
          </Text>
          <Button
            fullWidth
            size="md"
            radius="xl"
            style={{
              background: "linear-gradient(90deg, #0B3C5D 0%, #1E6072 100%)",
            }}
            loading={loading}
            disabled={loading}
            onClick={handleResend}
          >
            RESEND RESET LINK
          </Button>
        </Stack>
      )}
      <Stack
        justify="space-between"
        mt={48}
      >
        <Text size="12px" c="dimmed" ta="center">
          Still not on Snowkap?{" "}
          <Anchor c="#003B52" component={Link} href="/register" size="12px">
            Create Account
          </Anchor>
        </Text>
      </Stack>
      <Text size="xs" c="dimmed" ta="center" mt={64}>
        © 2025 SNOWKAP
      </Text>
    </AuthLayout>
  );
}
