/**
 * GET /api/portfolios - Get all portfolios (Admin only)
 * POST /api/portfolios - Create new portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Portfolio, User } from '@/lib/db/models';

export const GET = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const portfolios = await Portfolio.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error: any) {
    console.error('Error fetching all portfolios:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch portfolios',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const { user_id, portfolio_url, technologies } = await req.json();

    // Validation
    if (!user_id || !portfolio_url || !technologies) {
      return NextResponse.json(
        {
          success: false,
          message: 'Required fields: user_id, portfolio_url, technologies',
        },
        { status: 400 }
      );
    }

    // Validate technologies is an array
    if (!Array.isArray(technologies) || technologies.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Technologies must be a non-empty array',
        },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(portfolio_url)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid portfolio URL format',
        },
        { status: 400 }
      );
    }

    // Get the highest display_order for this user and increment
    const maxOrder = await Portfolio.max('display_order', {
      where: { user_id },
    });
    const display_order = (maxOrder || 0) + 1;

    const portfolio = await Portfolio.create({
      user_id,
      portfolio_url,
      technologies,
      display_order,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Portfolio created successfully',
        data: portfolio,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create portfolio',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
