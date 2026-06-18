"use client";

import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Group,
  Text,
  Stack,
  Anchor,
  Divider,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { useRouter } from "next/navigation";

const lookupSchema = z
  .object({
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    mobile: z
      .string()
      .regex(/^\d{10}$/, "Mobile number must be 10 digits")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) =>
      (data.email && data.email !== "") || (data.mobile && data.mobile !== ""),
    {
      message: "Either email or mobile is required",
      path: ["email"],
    }
  );

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  // Step 1: Email/Phone lookup
  const lookupForm = useForm({
    initialValues: { email: "", mobile: "" },
    validate: zodResolver(lookupSchema),
  });

  // Step 2: Password entry
  const passwordForm = useForm({
    initialValues: { password: "" },
    validate: zodResolver(passwordSchema),
  });

  const handleLookup = async (values: typeof lookupForm.values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, step: "lookup" }),
      });
      const data = await res.json();
      if (!res.ok || !data.found) {
        if (values.email && values.email.trim() !== "") {
          lookupForm.setFieldError("email", data.message || "User not found");
        } else if (values.mobile && values.mobile.trim() !== "") {
          lookupForm.setFieldError("mobile", data.message || "User not found");
        }
        return;
      }
      setUsername(data.username);
      setStep(2);
    } catch {
      if (values.email && values.email.trim() !== "") {
        lookupForm.setFieldError(
          "email",
          "Something went wrong. Please try again."
        );
      } else if (values.mobile && values.mobile.trim() !== "") {
        lookupForm.setFieldError(
          "mobile",
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (values: typeof passwordForm.values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: values.password,
          step: "auth",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        passwordForm.setFieldError(
          "password",
          data.message || "Sign in failed"
        );
        return;
      }
      notifications.show({
        title: "Success",
        message: data.message,
        color: "green",
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      passwordForm.setFieldError(
        "password",
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      rightImage="/signin-right.png"
      rightTitle="Nestle Purina and Maersk united for a more sustainable world"
      rightDescription="Find out about the partnership between Nestlé Purina and Maersk, joining forces to revitalize the train as a more sustainable model..."
      heading="Sign in"
      subheading="Let's navigate your journey to Net Zero"
      showLogo={true}
    >
      {step === 1 && (
        <form onSubmit={lookupForm.onSubmit(handleLookup)}>
          <TextInput
            placeholder="Enter Email ID"
            mb={16}
            data-autofocus
            {...lookupForm.getInputProps("email")}
            error={lookupForm.errors.email}
          />
          <Group justify="center" align="center" mb={16} gap={8}>
            <Divider style={{ flex: 1 }} />
            <Text c="dimmed" size="sm">
              OR
            </Text>
            <Divider style={{ flex: 1 }} />
          </Group>
          <TextInput
            placeholder="Enter Mobile Number"
            maxLength={10}
            mb={24}
            {...lookupForm.getInputProps("mobile")}
            error={lookupForm.errors.mobile}
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
            NEXT
          </Button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={passwordForm.onSubmit(handleAuth)}>
          <Stack gap={24}>
            <Text size="24px" fw={300}>
              Hi {username},
            </Text>
            <PasswordInput
              placeholder="Enter Password"
              {...passwordForm.getInputProps("password")}
              error={passwordForm.errors.password}
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
              SIGN IN
            </Button>
          </Stack>
        </form>
      )}
      <Stack justify="space-between" mt={24}>
        <Text size="12px" c="dimmed" ta="center">
          Need Help?{" "}
          <Anchor
            c="#003B52"
            component={Link}
            href="/forgot-password"
            size="12px"
          >
            Forgot Password
          </Anchor>
        </Text>
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
