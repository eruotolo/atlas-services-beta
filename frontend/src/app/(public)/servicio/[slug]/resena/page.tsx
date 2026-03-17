import { notFound } from 'next/navigation';

import { getServerSession } from 'next-auth';

import { getServicioBySlug } from '@/features/services/actions';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import LeaveReviewClient from './LeaveReviewClient';

export default async function LeaveReviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    const service = await getServicioBySlug(slug);

    if (!service) {
        notFound();
    }

    const currentUser = session?.user
        ? {
              id: session.user.id,
              name: session.user.name || null,
              email: session.user.email || null,
          }
        : null;

    return <LeaveReviewClient service={service} currentUser={currentUser} />;
}
