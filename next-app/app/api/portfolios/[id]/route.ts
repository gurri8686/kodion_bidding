/**
 * GET /api/portfolios/[id] - Get single portfolio by ID
 * PUT /api/portfolios/[id] - Update portfolio
 * DELETE /api/portfolios/[id] - Delete portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Portfolio, User } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const { id } = params;

    const portfolio = await Portfolio.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email'],
        },
      ],
    });

    if (!portfolio) {
      return NextResponse.json(
        {
          success: false,
          message: 'Portfolio not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: portfolio,
    });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch portfolio',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const { id } = params;
    const { portfolio_url, technologies } = await req.json();

    const portfolio = await Portfolio.findByPk(id);

    if (!portfolio) {
      return NextResponse.json(
        {
          success: false,
          message: 'Portfolio not found',
        },
        { status: 404 }
      );
    }

    // Validate technologies if provided
    if (technologies !== undefined) {
      if (!Array.isArray(technologies) || technologies.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Technologies must be a non-empty array',
          },
          { status: 400 }
        );
      }
    }

    // Validate URL if provided
    if (portfolio_url) {
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
    }

    // Update only provided fields
    const updateData: any = {};
    if (portfolio_url !== undefined) updateData.portfolio_url = portfolio_url;
    if (technologies !== undefined) updateData.technologies = technologies;

    await portfolio.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio,
    });
  } catch (error: any) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update portfolio',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const { id } = params;

    const portfolio = await Portfolio.findByPk(id);

    if (!portfolio) {
      return NextResponse.json(
        {
          success: false,
          message: 'Portfolio not found',
        },
        { status: 404 }
      );
    }

    await portfolio.destroy();

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete portfolio',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
