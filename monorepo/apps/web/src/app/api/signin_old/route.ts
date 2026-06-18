import { NextRequest, NextResponse } from 'next/server';

// Dummy users
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

  // Step 1: Lookup by email or phone
  if (body.step === 'lookup') {
    const { email, phone } = body;
    const user = users.find(
      (u) => (email && u.email === email) || (phone && u.phone === phone)
    );
    if (!user) {
      return NextResponse.json({ found: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ found: true, username: user.username });
  }

  // Step 2: Authenticate by username and password
  if (body.step === 'auth') {
    const { username, password } = body;
    const user = users.find((u) => u.username === username);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Incorrect Password. Please try again.' }, { status: 401 });
    }
    return NextResponse.json({ success: true, message: 'Signed in successfully!' });
  }

  return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
} 
