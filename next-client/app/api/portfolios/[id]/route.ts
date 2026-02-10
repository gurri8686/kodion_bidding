import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Portfolio, User } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getHandler(req: NextRequest, context: any) {
  try {
    const { id } = context.params;

    const portfolio = await Portfolio.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email']
        }
      ]
    });

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        message: 'Portfolio not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: (error as Error).message
    }, { status: 500 });
  }
}

async function putHandler(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const { portfolio_url, technologies } = await req.json();

    const portfolio = await Portfolio.findByPk(id);

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        message: 'Portfolio not found'
      }, { status: 404 });
    }

    if (technologies !== undefined) {
      if (!Array.isArray(technologies) || technologies.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Technologies must be a non-empty array'
        }, { status: 400 });
      }
    }

    if (portfolio_url) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(portfolio_url)) {
        return NextResponse.json({
          success: false,
          message: 'Invalid portfolio URL format'
        }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (portfolio_url !== undefined) updateData.portfolio_url = portfolio_url;
    if (technologies !== undefined) updateData.technologies = technologies;

    await portfolio.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update portfolio',
      error: (error as Error).message
    }, { status: 500 });
  }
}

async function deleteHandler(req: NextRequest, context: any) {
  try {
    const { id } = context.params;

    const portfolio = await Portfolio.findByPk(id);

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        message: 'Portfolio not found'
      }, { status: 404 });
    }

    await portfolio.destroy();

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete portfolio',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
