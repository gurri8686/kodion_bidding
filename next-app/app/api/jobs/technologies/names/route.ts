/**
 * GET /api/jobs/technologies/names
 * Get all technology names
 */

import { NextRequest, NextResponse } from 'next/server';
import { Technologies } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  try {
    const technologies = await Technologies.findAll({
      attributes: ['name'],
      order: [['name', 'ASC']],
    });

    const names = technologies.map((t: any) => t.name);
    return NextResponse.json({ technologies: names });
  } catch (error: any) {
    console.error('Error fetching all technology names:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
