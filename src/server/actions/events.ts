'use server';

import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import 'use-server';

import db from '@/drizzle/db';
import { EventTable } from '@/drizzle/schema';
import { eventFormSchema } from '@/schema/events';

export async function createEvent(
   unsafeData: z.infer<typeof eventFormSchema>
): Promise<{ error: boolean } | undefined> {
   const { userId } = auth();
   const { success, data } = eventFormSchema.safeParse(unsafeData);

   if (!success || userId == null) {
      return { error: true };
   }

   await db.insert(EventTable).values({ ...data, clerkUserId: userId });

   redirect('/events');
}

export async function updateEvent(
   id: string,
   unsafeData: z.infer<typeof eventFormSchema>
): Promise<{ error: boolean } | undefined> {
   const { userId } = auth();
   const { success, data } = eventFormSchema.safeParse(unsafeData);

   if (!success || userId == null) {
      return { error: true };
   }

   const { count } = await db
      .update(EventTable)
      .set({ ...data })
      .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)));

   if (count === 0) {
      return { error: true };
   }

   redirect('/events');
}

export async function deleteEvent(id: string): Promise<{ error: boolean } | undefined> {
   const { userId } = auth();

   if (userId == null) {
      return { error: true };
   }

   const { count } = await db.delete(EventTable).where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)));

   if (count === 0) {
      return { error: true };
   }

   redirect('/events');
}
