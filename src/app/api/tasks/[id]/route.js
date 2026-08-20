import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import FarmingTask from '@/lib/db/models/FarmingTask';

// PUT /api/tasks/[id]
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    await connectDB();

    if (body.status === 'completed' && !body.completedAt) {
      body.completedAt = new Date();
    }

    const task = await FarmingTask.findOneAndUpdate(
      { _id: id, owner: user._id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('[Task PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update task.' }, { status: 500 });
  }
});

// DELETE /api/tasks/[id]
export const DELETE = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const task = await FarmingTask.findOneAndDelete({ _id: id, owner: user._id });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('[Task DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task.' }, { status: 500 });
  }
});
