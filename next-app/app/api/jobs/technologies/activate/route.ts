/**
 * POST /api/jobs/technologies/activate
 * Activate a technology for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Technologies, UserTechnologies } from '@/lib/db/models';

export const POST = withAuth(async (req: NextRequest, context: any, user: AuthenticatedUser) => {
  try {
    const { userId, technologyName } = await req.json();

    // Normalize the technology name to handle case insensitivity
    const formattedTechName = technologyName.trim().toLowerCase();

    // Find technology by matching name or aliases (case insensitive)
    const technology = await Technologies.findOne({
      where: {
        [Op.or]: [
          // Match the 'name' column (case insensitive)
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), formattedTechName),
          // Match the 'aliases' JSON column (case insensitive)
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('aliases')), {
            [Op.like]: `%${formattedTechName}%`,
          }),
        ],
      },
    });

    if (!technology) {
      return NextResponse.json({ message: 'Technology not found' }, { status: 404 });
    }

    // Check if the user already has this technology
    const existingTech = await UserTechnologies.findOne({
      where: {
        userId,
        technologyId: (technology as any).id,
      },
    });

    if (existingTech) {
      if ((existingTech as any).is_active === false) {
        // If the technology is inactive, reactivate it
        (existingTech as any).is_active = true;
        await existingTech.save();
        return NextResponse.json({ message: 'Technology reactivated successfully' });
      } else {
        // If the technology is already active, send a message
        return NextResponse.json({ message: 'Technology is already active for this user' }, { status: 400 });
      }
    }

    // If the user does not have the technology, create a new entry
    await UserTechnologies.create({
      userId,
      technologyId: (technology as any).id,
      is_active: true,
    });

    return NextResponse.json({ message: 'Technology added successfully' });
  } catch (error: any) {
    console.error('Error adding technology:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
});
