'use client';

import { Container, Table, Text, Group, TextInput, Badge, Pagination, Select, Stack } from '@mantine/core';
import { IconSearch, IconCheck, IconX, IconMinus } from '@tabler/icons-react';
import { Header } from '@/components/Header';

const data = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  location: 'Location 1',
  month: new Date(2021, i % 12, 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
  p: true,
  w: true,
  us: true,
  ef: true,
  ec: true,
  eg: true,
  mf: true,
  bs: '02',
  status: 'Pending'
}));

export default function ActivityRecords() {
  return (
    <Stack style={{ minHeight: '100vh' }}>
      <Header />
      <Container size="xl" py="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <Text>Activity Data Records</Text>
              <Group gap={5}>
                <Badge leftSection={<IconCheck size={12} />} color="green">Completed</Badge>
                <Badge leftSection={<IconX size={12} />} color="red">Pending</Badge>
                <Badge leftSection={<IconMinus size={12} />} color="gray">Not Applicable</Badge>
              </Group>
            </Group>
            <TextInput
              placeholder="Search..."
              leftSection={<IconSearch size={16} />}
              style={{ width: 250 }}
            />
          </Group>

          <Group>
            <Badge variant="light">All (45)</Badge>
            <Badge variant="outline">Completed (0)</Badge>
            <Badge variant="outline">Pending (45)</Badge>
          </Group>

          <Table striped withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>SN</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Month</Table.Th>
                <Table.Th>P</Table.Th>
                <Table.Th>W</Table.Th>
                <Table.Th>US</Table.Th>
                <Table.Th>EF</Table.Th>
                <Table.Th>EC</Table.Th>
                <Table.Th>EG</Table.Th>
                <Table.Th>MF</Table.Th>
                <Table.Th>BS</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.slice(0, 10).map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>{row.id}</Table.Td>
                  <Table.Td>{row.location}</Table.Td>
                  <Table.Td>{row.month}</Table.Td>
                  <Table.Td>{row.p && <IconCheck size={16} color="green" />}</Table.Td>
                  <Table.Td>{row.w && <IconCheck size={16} color="green" />}</Table.Td>
                  <Table.Td>{row.us && <IconCheck size={16} color="green" />}</Table.Td>
                  <Table.Td>{row.ef && <IconCheck size={16} color="green" />}</Table.Td>
                  <Table.Td>{row.ec && <IconCheck size={16} color="green" />}</Table.Td>
                  <Table.Td>{row.eg && <IconCheck size={16} color="green" />}</Table.Td>
                  <Table.Td>{row.mf && <IconCheck size={16} color="green" />}</Table.Td>
                  <Table.Td>{row.bs}</Table.Td>
                  <Table.Td>
                    <Badge color="orange">{row.status}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group justify="space-between" align="center">
            <Pagination total={5} />
            <Group>
              <Text size="sm">Items per page:</Text>
              <Select
                data={['10', '20', '30', '40', '50']}
                value="10"
                style={{ width: 80 }}
              />
              <Text size="sm" c="dimmed">1-10 of 45</Text>
            </Group>
          </Group>
        </Stack>
      </Container>
    </Stack>
  );
}
