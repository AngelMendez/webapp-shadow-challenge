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
      console.error('N8N webhook URL not configured');
      return NextResponse.json(
        {
          error: 'N8N webhook URL not configured',
          message: 'The chatbot is not configured. Please set up N8N webhook URL.'
        },
        { status: 500 }
      );
    }

    console.log('Sending request to N8N:', n8nWebhookUrl);

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

    console.log('N8N response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('N8N webhook error:', errorText);
      return NextResponse.json(
        {
          error: `N8N webhook failed with status ${n8nResponse.status}`,
          message: 'The chatbot service is temporarily unavailable. Please try again later.',
          details: errorText
        },
        { status: 500 }
      );
    }

    const data = await n8nResponse.json();
    console.log('N8N response data:', data);

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Chatbot API error:', error);

    // If N8N is not set up, return a helpful message
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          message: '🤖 Chatbot is in demo mode. N8N integration coming soon!\n\nFor now, you can:\n• Add tasks using the form above\n• Check your task list\n• Mark tasks as complete'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process chatbot request',
        message: 'Sorry, I encountered an error. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
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
