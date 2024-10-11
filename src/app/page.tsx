import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function HomePage() {
   const { userId } = auth();
   if (userId) redirect('/events');

   return (
      <div className='text-center container mx-auto flex justify-center h-screen flex-col gap-5'>
         <h1 className='text-3xl'>Hello New App</h1>

         <div className='flex gap-2 justify-center'>
            <Button asChild>
               <SignInButton />
            </Button>
            <Button asChild>
               <SignUpButton />
            </Button>
         </div>
      </div>
   );
}
