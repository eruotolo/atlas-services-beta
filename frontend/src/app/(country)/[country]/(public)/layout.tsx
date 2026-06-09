import type { ReactElement, ReactNode } from 'react';

import { getServerSession } from 'next-auth';

import Footer from '@/shared/components/layout/Footer';
import Navbar from '@/shared/components/layout/Navbar';
import { ChatbotWidget } from '@/shared/components/hireeo/ui/ChatbotWidget';
import { SubscriptionLevel } from '@/shared/types/common';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function PublicLayout({
    children,
}: {
    children: ReactNode;
}): Promise<ReactElement> {
    const session = await getServerSession(authOptions);

    const currentUser = session?.user
        ? {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.name || '',
              role: session.user.roles?.includes('SuperAdministrador')
                  ? ('admin' as const)
                  : ('usuario' as const),
              subscription:
                  (session.user.nivelSuscripcion as unknown as SubscriptionLevel) ||
                  SubscriptionLevel.BASICO,
          }
        : null;

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar user={currentUser} />
            <main className="page-fade-in flex-grow">{children}</main>
            <Footer />
            <ChatbotWidget />
        </div>
    );
}
