'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Box, Container, Grid, Text, Paper, Flex, Button } from '@mantine/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  lineColor?: string;
  navigationPath?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  buttonText,
  lineColor = '#0D4D5E',
  navigationPath
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigation = () => {
    if (isClient && navigationPath) {
      window.location.href = navigationPath;
    }
  };

  return (
    <Paper
      withBorder
      radius="md"
      shadow="xs"
      style={{
        minWidth: 387,
        maxWidth: 387,
        height: 224,
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        component="div"
        style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          transform: 'translateY(-20%)',
          width: 16,
          height: 52,
          backgroundColor: "#fc960c",
          borderTopRightRadius: 5,
          borderBottomRightRadius: 5
        }}
      />
      <Flex
        h="100%"
        p="xl"
        direction="column"
        justify="space-between"
        style={{ flex: 1 }}
      >
        <Box>
          <Text component="h3" size="xl" fw={600} c="#444444" mb="md">
            {title}
          </Text>
          <Text size="sm" c="gray.6" mb="lg">
            {description}
          </Text>
        </Box>
        <Button
          variant="filled"
          color="white"
          px="md"
          py="xs"
          radius="xl"
          style={{
            alignSelf: 'flex-start',
            background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%) !important',
            border: 'none'
          }}
          onClick={handleNavigation}
        >
          {buttonText}
        </Button>
      </Flex>
    </Paper>
  );
};

export default function DashboardPage() {
  return (
    <Box bg="gray.1" style={{ minHeight: '100vh' }}>
      <Header />
      <Container size="xl" py={40}>
        <Grid>
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <Flex gap="md" wrap="wrap">
              <DashboardCard
                title="My Profile"
                description="Add/Update your profile with new funds, portfolio companies, user details and more"
                buttonText="VIEW PROFILE"
              />
              <DashboardCard
                title="My Suppliers"
                description="Invite your suppliers to track their activity data to compute your Scope 3 emissions."
                buttonText="VIEW SUPPLIERS"
              />
              <DashboardCard
                title="Monthly Activity Data"
                description="Track your monthly data for fuel purchased, grid power, waste, and more"
                buttonText="VIEW RECORDS"
                navigationPath="/monthly-activity"
              />
            </Flex>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              src="/dashboard-illustration.svg"
              alt="Dashboard illustration"
              width={500}
              height={400}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}