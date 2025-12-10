import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_identifier, message } = body;

    if (!user_identifier || !message) {
      return NextResponse.json(
        { error: 'user_identifier and message are required' },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    // Forward request to N8N
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_identifier,
        message,
      }),
    });

    if (!n8nResponse.ok) {
      console.log('N8N webhook response:', n8nResponse.body);
      throw new Error(`N8N webhook failed with status ${n8nResponse.status}`);
    }

    const data = await n8nResponse.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chatbot request',
        message: 'Sorry, I encountered an error. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
