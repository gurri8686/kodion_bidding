/**
 * GET /api/jobs/technologies/all-active
 * Get all active technologies (unique list)
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserTechnologies, Technologies } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  try {
    const technologies = await UserTechnologies.findAll({
      where: { is_active: true },
      include: [
        {
          model: Technologies,
          as: 'technology',
          attributes: ['name'],
        },
      ],
      raw: true,
    });

    // Extract and deduplicate technology names
    const techNamesSet = new Set(technologies.map((t: any) => t['technology.name']));

    const uniqueTechnologies = Array.from(techNamesSet);
    return NextResponse.json({ technologies: uniqueTechnologies });
  } catch (error: any) {
    console.error('Error fetching unique active technologies:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
