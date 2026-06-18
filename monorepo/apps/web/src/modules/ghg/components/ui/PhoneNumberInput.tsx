"use client";

import { CheckIcon, Flex, Group, Menu, Text, TextInput } from "@mantine/core";
import { countries } from "country-data";
import * as Flags from "country-flag-icons/react/3x2";
import React, { useCallback, useMemo, useState } from "react";

export type CountryOption = {
  value: string;
  label: string;
  flag: React.ReactNode;
  dialCode: string;
};

// Memoized flag component to avoid re-rendering
const CountryFlag = React.memo(({ countryCode }: { countryCode: string }) => {
  const Flag = (Flags as any)[countryCode];
  return Flag ? <Flag width="18" height="18" /> : null;
});

CountryFlag.displayName = "CountryFlag";

// Memoize country options to avoid recreating on every render
const countryOptions: CountryOption[] = countries.all
  .filter((c) => c.countryCallingCodes.length > 0)
  .map((c) => ({
    value: c.alpha2,
    label: c.name,
    flag: null,
    dialCode: c.countryCallingCodes[0],
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function PhoneNumberInput({
  value,
  onChangeHandler,
  defaultCountry = "IN",
  label = "Mobile",
  error,
  required = false,
  isDisabled = false,
}: {
  value?: { value: string; countryCode: string };
  onChangeHandler?: (value: string, countryCode: string) => void;
  defaultCountry?: string;
  label?: string;
  required?: boolean;
  error?: string;
  showDropdown?: boolean;
  isDisabled?: boolean;
}) {
  const defaultSelectedCountry = useMemo(() => {
    return (
      countryOptions.find(
        (c) => c.value === (value?.countryCode || defaultCountry)
      ) || countryOptions[0]
    );
  }, [value?.countryCode, defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    defaultSelectedCountry
  );

  // console.log({ value, defaultCountry, selectedCountry });

  const [number, setNumber] = useState({
    value: value?.value || "",
    countryCode: value?.countryCode || defaultCountry,
  });

  // Sync internal state with external value prop
  React.useEffect(() => {
    if (value) {
      setNumber({
        value: value.value || "",
        countryCode: value.countryCode || defaultCountry,
      });

      const country = countryOptions.find((c) => c.value === value.countryCode);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [value?.value, value?.countryCode, defaultCountry]);

  const handleChange = useCallback(
    (value: string, countryCode: string) => {
      setNumber((prev) => ({ ...prev, value, countryCode }));
      if (onChangeHandler) onChangeHandler(value, countryCode);
    },
    [onChangeHandler]
  );

  const handleCountryChange = useCallback(
    (countryCode: string | null) => {
      if (countryCode) {
        const country = countryOptions.find((c) => c.value === countryCode);
        if (country) {
          setSelectedCountry(country);
          handleChange(number.value, countryCode);
        }
      }
    },
    [handleChange, number.value]
  );

  // Performance optimization: limit initial render to 50 countries
  const [showAllCountries, setShowAllCountries] = useState(false);
  const visibleCountries = useMemo(() => {
    return showAllCountries ? countryOptions : countryOptions.slice(0, 50);
  }, [showAllCountries]);

  return (
    <TextInput
      disabled={isDisabled}
      maxLength={20}
      label={label}
      required={required}
      placeholder="Enter phone number"
      value={number.value}
      onChange={(e) => handleChange(e.currentTarget.value, number.countryCode)}
      onKeyDown={(e) => {
        const allowedKeys = [
          "Backspace",
          "Delete",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
          "Tab",
        ];
        const allowedChars = /[0-9\s\-()]/;
        if (allowedKeys.includes(e.key) || allowedChars.test(e.key)) {
          return;
        }
        e.preventDefault();
      }}
      error={error}
      leftSection={
        <Menu position="bottom-start" onOpen={() => setShowAllCountries(false)}>
          <Menu.Target>
            <Flex
              style={{
                width: "100px",
                paddingLeft: "33px",
                cursor: "pointer",
              }}
              gap={5}
              direction={"row"}
              wrap={"nowrap"}
              align="flex-start"
            >
              <div
                style={{
                  borderRadius: "1px",
                  display: "flex",
                  alignSelf: "center",
                }}
              >
                <CountryFlag countryCode={selectedCountry.value} />
              </div>
              <span
                style={{
                  marginLeft: 0,
                  fontSize: 12,
                  color: "#444444",
                  marginTop: 3,
                  textWrap: "nowrap",
                }}
              >
                {selectedCountry.dialCode}
              </span>
            </Flex>
          </Menu.Target>
          <Menu.Dropdown
            styles={{
              dropdown: {
                width: 250,
                maxHeight: 200,
                overflowY: "auto",
              },
            }}
          >
            {visibleCountries.map((country) => (
              <Menu.Item
                key={country.value}
                onClick={() => handleCountryChange(country.value)}
                style={{
                  backgroundColor:
                    country.value === selectedCountry.value
                      ? "var(--mantine-color-gray-1)"
                      : undefined,
                }}
              >
                <Group gap="xs" style={{ flexWrap: "nowrap" }}>
                  <span>
                    {country.value === selectedCountry.value && (
                      <CheckIcon size={12} color="#666666" />
                    )}
                  </span>
                  <CountryFlag countryCode={country.value} />
                  <Text size="xs" style={{ color: "#666666" }}>
                    {country.label}
                  </Text>
                  <Text size="xs" style={{ color: "#666666" }}>
                    {country.dialCode}
                  </Text>
                </Group>
              </Menu.Item>
            ))}
            {!showAllCountries && countryOptions.length > 50 && (
              <Menu.Item
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAllCountries(true);
                }}
                closeMenuOnClick={false}
                style={{ textAlign: "center", fontStyle: "italic" }}
              >
                <Text size="xs" style={{ color: "#888888" }}>
                  Load more countries...
                </Text>
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      }
      styles={{
        label: {
          fontWeight: 400,
          fontSize: 12,
          color: "#888888",
        },
        input: {
          fontWeight: 400,
          fontSize: 12,
          color: "#444444",
          paddingLeft: "80px",
        },
        error: {
          fontSize: 10,
        },
      }}
    />
  );
}
