'use server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import 'use-server';
import { z } from 'zod';

import db from '@/drizzle/db';
import { ScheduleAvailabilityTable, ScheduleTable } from '@/drizzle/schema';
import { scheduleFormSchema } from '@/schema/schedule';

export async function saveSchedule(unsafeData: z.infer<typeof scheduleFormSchema>) {
   const { userId } = auth();
   const { success, data } = scheduleFormSchema.safeParse(unsafeData);

   if (!success || userId == null) {
      return { error: true };
   }

   const { availabilities, ...scheduleData } = data;

   // Insert or update the schedule
   const [{ id: scheduleId }] = await db
      .insert(ScheduleTable)
      .values({ ...scheduleData, clerkUserId: userId })
      .onConflictDoUpdate({
         target: ScheduleTable.clerkUserId,
         set: scheduleData,
      })
      .returning({ id: ScheduleTable.id });

   // Delete existing availabilities
   const deleteAvailabilities = db
      .delete(ScheduleAvailabilityTable)
      .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId));

   // Insert new availabilities, if any
   let insertAvailabilities;
   if (availabilities.length > 0) {
      insertAvailabilities = db.insert(ScheduleAvailabilityTable).values(
         availabilities.map((availability) => ({
            ...availability,
            scheduleId,
         }))
      );
   }

   // Execute both queries (delete and insert) in parallel using Promise.all
   await Promise.all([deleteAvailabilities, insertAvailabilities]);

   return { success: true };
}
