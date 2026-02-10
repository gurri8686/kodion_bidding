import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Technologies, UserTechnologies } from '@/lib/db/models';
import { Op, Sequelize } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  const { userId, technologyName } = await req.json();

  try {
    const formattedTechName = technologyName.trim().toLowerCase();

    const technology = await Technologies.findOne({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), formattedTechName),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('aliases')), {
            [Op.like]: `%${formattedTechName}%`,
          })
        ]
      }
    });

    if (!technology) {
      return NextResponse.json(
        { message: 'Technology not found' },
        { status: 404 }
      );
    }

    const existingTech = await UserTechnologies.findOne({
      where: {
        userId,
        technologyId: technology.id,
      }
    });

    if (existingTech) {
      if (existingTech.is_active === false) {
        existingTech.is_active = true;
        await existingTech.save();
        return NextResponse.json({ message: 'Technology reactivated successfully' });
      } else {
        return NextResponse.json(
          { message: 'Technology is already active for this user' },
          { status: 400 }
        );
      }
    }

    await UserTechnologies.create({
      userId,
      technologyId: technology.id,
      is_active: true,
    });

    return NextResponse.json({ message: 'Technology added successfully' });
  } catch (error) {
    console.error('Error adding technology:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
