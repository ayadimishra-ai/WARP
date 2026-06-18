import { NextRequest, NextResponse } from 'next/server';
 
// Dummy users (same as in signin)
const users = [
  {
    id: 1,
    email: 'john@example.com',
    phone: '1234567890',
    username: 'johnny',
    password: 'password123',
  },
  {
    id: 2,
    email: 'jane@example.com',
    phone: '9876543210',
    username: 'jane_doe',
    password: 'securepass',
  },
];
 
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;
  // Simulate lookup
  const user = users.find((u) => u.email === email);
  // Always return success for security (do not reveal if email exists)
  return NextResponse.json({
    message: `If an account with ${email} exists, a reset link has been sent.`,
    sent: true,
  });
}