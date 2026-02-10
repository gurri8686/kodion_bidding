import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Portfolio, User } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getHandler(req: NextRequest, context: any) {
  try {
    const portfolios = await Portfolio.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email']
        }
      ],
      order: [
        ['created_at', 'DESC']
      ]
    });

    return NextResponse.json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    console.error('Error fetching all portfolios:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: (error as Error).message
    }, { status: 500 });
  }
}

async function postHandler(req: NextRequest, context: any) {
  try {
    const { user_id, portfolio_url, technologies } = await req.json();

    if (!user_id || !portfolio_url || !technologies) {
      return NextResponse.json({
        success: false,
        message: 'Required fields: user_id, portfolio_url, technologies'
      }, { status: 400 });
    }

    if (!Array.isArray(technologies) || technologies.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Technologies must be a non-empty array'
      }, { status: 400 });
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(portfolio_url)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid portfolio URL format'
      }, { status: 400 });
    }

    const maxOrder = await Portfolio.max('display_order', {
      where: { user_id }
    });
    const display_order = (maxOrder || 0) + 1;

    const portfolio = await Portfolio.create({
      user_id,
      portfolio_url,
      technologies,
      display_order
    });

    return NextResponse.json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create portfolio',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
