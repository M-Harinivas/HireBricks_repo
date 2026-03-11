import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';

export const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar transparentDefault={false} />
            {/* 
        Add padding top to account for the fixed navbar 
        since transparentDefault is false, the navbar will have a solid background immediately
      */}
            <main className="flex-1 pt-16 md:pt-18 pb-10">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};
