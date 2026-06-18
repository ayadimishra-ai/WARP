'use client';
import { useState } from 'react';
import { Box, Stack, Group, Text, TextInput, Button, Select, FileInput, Textarea, Avatar, Paper, ActionIcon, PasswordInput, Divider } from '@mantine/core';
import { IconInfoCircle, IconDownload, IconTrash } from '@tabler/icons-react';
import Image from 'next/image';

const profile = {
  name: 'Manish Sharma',
  email: 'mani.sharma@gmail.com',
  avatar: '/profile-image.jpg',
};

const sidebarLinks = [
  'Personal Profile',
  'Manage Password',
  'Bank Details',
  'Notification Settings',
];

function getUserInitials(userName: string): string {
  const initials = userName.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('');
  return initials || 'GU';
}

export function MyAccount() {
  const [activeLink, setActiveLink] = useState('Personal Profile');

  function renderContent() {
    switch (activeLink) {
      case 'Personal Profile':
        return (
          <>
            <Text fz={32} fw={700} c="#153D56" mb={4}>Personal Profile</Text>
            <Text fz={16} c="#153D56" mb={32}>Ensure your profile information is accurate.</Text>
            <form>
              <Stack gap={24}>
                <Group gap={24} grow>
                  <TextInput label={null} placeholder="Manish Sharma" defaultValue={profile.name} />
                  <TextInput label={null} placeholder="mani.sharma@gmail.com" defaultValue={profile.email} />
                  <TextInput label={null} placeholder="Well-N-Fine Pharma" />
                </Group>
                <Group gap={24} grow>
                  <Select label={null} placeholder="Select Country of Operation" data={[]} />
                  <TextInput label={null} placeholder="(1) 2536 2561 2365" />
                  <Select label={null} placeholder="Select Category" data={[]} />
                </Group>
                <Group gap={24} grow>
                  <Select label={null} placeholder="Select Designation" data={[]} />
                  <Select label={null} placeholder="Select Language" data={[]} />
                  <FileInput label={null} placeholder="Upload Profile Pic (.jpg, or .png)" rightSection={<IconDownload size={18} />} />
                </Group>
                <Group gap={16} align="center">
                  <Text fz={16} c="#153D56" style={{ flex: 1 }}>Profilepic.jpg</Text>
                  <ActionIcon color="gray" variant="subtle"><IconTrash size={20} /></ActionIcon>
                  <ActionIcon color="gray" variant="subtle"><IconDownload size={20} /></ActionIcon>
                </Group>
                <Textarea 
                  label="Description" 
                  placeholder="Enter Description" 
                  minRows={4} 
                  styles={{
                    label: {
                      marginBottom: 8,
                      fontSize: 14,
                      color: '#153D56',
                      fontWeight: 500
                    },
                    input: {
                      borderColor: '#B6E2E0',
                      borderRadius: 8,
                      minHeight: 110,
                      '&:focus': {
                        borderColor: '#0D4D5E'
                      }
                    }
                  }}
                />
                <Group gap={16} mt={8}>
                  <Button 
                    type="submit" 
                    style={{ 
                      background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      color: 'white',
                      transition: 'background 0.3s ease'
                    }}
                  >UPDATE</Button>
                  <Button 
                    variant="outline" 
                    style={{ 
                      color: '#0D4D5E', 
                      borderColor: '#0D4D5E', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      transition: 'all 0.3s ease'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)',
                          color: 'white',
                          borderColor: 'transparent'
                        }
                      }
                    }}
                  >CANCEL</Button>
                </Group>
              </Stack>
            </form>
          </>
        );
      case 'Manage Password':
        return (
          <>
            <Text fz={32} fw={700} c="#153D56" mb={4}>Manage Password</Text>
            <Text fz={16} c="#153D56" mb={32}>Change your account password below.</Text>
            <form>
              <Stack gap={24}>
                <PasswordInput label="Current Password" placeholder="Enter current password" />
                <PasswordInput label="New Password" placeholder="Enter new password" />
                <PasswordInput label="Confirm New Password" placeholder="Confirm new password" />
                <Group gap={16} mt={8}>
                  <Button 
                    type="submit" 
                    style={{ 
                      background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      color: 'white',
                      transition: 'background 0.3s ease'
                    }}
                  >UPDATE</Button>
                  <Button 
                    variant="outline" 
                    style={{ 
                      color: '#0D4D5E', 
                      borderColor: '#0D4D5E', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      transition: 'all 0.3s ease'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)',
                          color: 'white',
                          borderColor: 'transparent'
                        }
                      }
                    }}
                  >CANCEL</Button>
                </Group>
              </Stack>
            </form>
          </>
        );
      case 'Bank Details':
        return (
          <>
            <Text fz={32} fw={700} c="#153D56" mb={4}>Bank Details</Text>
            <Text fz={16} c="#153D56" mb={32}>Keep your bank information up-to-date.</Text>
            <form>
              <Stack gap={24}>
                <Group gap={24} grow>
                  <TextInput label="Account Name" placeholder="Enter Account Name" />
                  <TextInput label="Account Number" placeholder="Enter Account Number" />
                </Group>
                <Group gap={24} grow>
                  <Select label="Bank Name" placeholder="Select Bank Name" data={[ 'HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank' ]} />
                  <Select label="Account Type" placeholder="Select Account Type" data={[ 'Savings Account', 'Current Account', 'Salary Account' ]} />
                </Group>
                <Group gap={24} grow>
                  <TextInput label="Branch Address" placeholder="Enter Branch Address" />
                  <TextInput label="IFSC Code" placeholder="Enter IFSC Code" />
                </Group>
                <Group gap={16} mt={8}>
                  <Button 
                    type="submit" 
                    style={{ 
                      background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      color: 'white',
                      transition: 'background 0.3s ease'
                    }}
                  >UPDATE</Button>
                  <Button 
                    variant="outline" 
                    style={{ 
                      color: '#0D4D5E', 
                      borderColor: '#0D4D5E', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      transition: 'all 0.3s ease'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)',
                          color: 'white',
                          borderColor: 'transparent'
                        }
                      }
                    }}
                  >CANCEL</Button>
                </Group>
              </Stack>
            </form>
          </>
        );
      case 'Notification Settings':
        return (
          <>
            <Text fz={32} fw={700} c="#153D56" mb={4}>Notification Settings</Text>
            <Text fz={16} c="#153D56" mb={32}>Manage your notification preferences.</Text>
            <form>
              <Stack gap={24}>
                <Select label="Email Notifications" placeholder="Select preference" data={[ 'All', 'Important Only', 'None' ]} />
                <Select label="SMS Notifications" placeholder="Select preference" data={[ 'All', 'Important Only', 'None' ]} />
                <Group gap={16} mt={8}>
                  <Button 
                    type="submit" 
                    style={{ 
                      background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      color: 'white',
                      transition: 'background 0.3s ease'
                    }}
                  >UPDATE</Button>
                  <Button 
                    variant="outline" 
                    style={{ 
                      color: '#0D4D5E', 
                      borderColor: '#0D4D5E', 
                      borderRadius: 999, 
                      fontWeight: 700, 
                      fontSize: 18, 
                      padding: '10px 36px',
                      transition: 'all 0.3s ease'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: 'linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)',
                          color: 'white',
                          borderColor: 'transparent'
                        }
                      }
                    }}
                  >CANCEL</Button>
                </Group>
              </Stack>
            </form>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <Box style={{ minHeight: '100vh', background: '#F6FBF9', display: 'flex', flexDirection: 'row' }}>
      {/* Sidebar */}
      <Box style={{ width: 320, padding: '40px 48px', background: '#E6F7F8', display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: 40, paddingBottom: 40 }}>
        {/* Top colored section with SVG */}
        <Box style={{ height: 120, background: '#45B8B0', borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        </Box>
        {/* Spacer */}
        <Box style={{ 
          height: 120, 
          background: '#E6F7F8', 
          position: 'relative'
        }}>
          <Box 
            style={{ 
              position: 'absolute', 
              width: 160, 
              height: 160, 
              borderRadius: '50%', 
              background: '#003b52', 
              top: '0%',
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: 600
            }} 
          >
            {getUserInitials(profile.name)}
          </Box>
        </Box>
        <Divider color="#B6E2E0" />
        {/* Navigation links */}
        <Stack gap={28} mt={32} style={{ paddingLeft: 32, paddingTop: 8 }}>
          {sidebarLinks.map(link => (
            <Text
              key={link}
              onClick={() => setActiveLink(link)}
              style={{
                fontWeight: link === activeLink ? 700 : 400,
                color: link === activeLink ? '#153D56' : '#153D56',
                fontSize: 18,
                cursor: 'pointer',
                letterSpacing: 0.1,
              }}
            >
              {link}
            </Text>
          ))}
        </Stack>
      </Box>
      {/* Main Content */}
      <Box style={{ flex: 1, padding: '40px 48px', background: '#F6FBF9', minWidth: 0 }}>
        <Paper radius={24} p={32} style={{ background: '#fff', minHeight: 600 }}>
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
} 