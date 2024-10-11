import { ReactNode } from 'react';

export default function BookLayout({ children }: { children: ReactNode }) {
   return <main className='container my-6'>{children}</main>;
}
