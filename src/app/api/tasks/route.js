import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import FarmingTask from '@/lib/db/models/FarmingTask';

// GET /api/tasks — list user tasks
export const GET = withAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');
    const status = searchParams.get('status');

    await connectDB();

    const query = { owner: user._id };
    if (farmId) query.farm = farmId;
    if (status) query.status = status;

    const tasks = await FarmingTask.find(query)
      .populate('farm', 'name')
      .populate('crop', 'name variety stage')
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('[Tasks GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load tasks.' }, { status: 500 });
  }
});

// POST /api/tasks — create new task
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { title, description, category, priority, dueDate, reminderDate, farm, crop, isRecurring, recurrence, notes } = body;

    if (!title?.trim() || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Task title and due date are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await FarmingTask.create({
      owner: user._id,
      title: title.trim(),
      description: description?.trim(),
      category: category || 'other',
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      farm: farm || undefined,
      crop: crop || undefined,
      isRecurring: Boolean(isRecurring),
      recurrence: isRecurring ? recurrence : undefined,
      notes: notes?.trim(),
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('[Tasks POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create task.' }, { status: 500 });
  }
});
