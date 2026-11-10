import { NextResponse } from 'next/server';
import { classifyComplaint } from '../../../lib/classifier';

export async function POST(request) {
  try {
    const body = await request.json();
    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim();
    const category = String(body.category ?? 'Infrastructure');

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    const classification = classifyComplaint(`${title} ${description}`, category);
    return NextResponse.json({
      id: `NR-${Math.floor(100000 + Math.random() * 900000)}`,
      title,
      description,
      category: classification.department,
      location: String(body.location ?? 'Not provided'),
      status: 'Department Assigned',
      createdAt: new Date().toISOString(),
      budget: 0,
      expenditure: 0,
      ...classification,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to process complaint.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mock API is ready. Complaint records are stored in the citizen browser session for this demo.',
    classifier: 'Nirnaya Core simulated inference',
  });
}
