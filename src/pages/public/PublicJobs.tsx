import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BriefcaseIcon, MapPin, Building2, Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { JobCard } from '@/components/JobCard';

const PublicJobs = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [workMode, setWorkMode] = useState('ALL');

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const pageSize = 24;
    const navigate = useNavigate();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when workMode changes
    useEffect(() => {
        setPage(1);
    }, [workMode]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const { data, count } = await apiService.getPaginatedJobs({
                    page,
                    pageSize,
                    search: debouncedSearch,
                    workMode: workMode === 'ALL' ? undefined : workMode
                });

                setJobs(data || []);
                setTotalJobs(count || 0);
            } catch (err) {
                console.error('Error fetching jobs:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, [debouncedSearch, workMode, page, pageSize]);

    const handleApplyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast('Please sign in to view more details and apply.', { icon: '🔒' });
        navigate('/signup');
    };

    const handleNextPage = () => {
        if (page >= 2) {
            toast('Please sign in to view more jobs.', { icon: '🔒' });
            navigate('/signup');
        } else {
            setPage(p => Math.min(Math.ceil(totalJobs / pageSize), p + 1));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-4">
            <SEO
                title="Job Board | HireBricks"
                description="Browse the latest opportunities on HireBricks. Sign up for free to apply with one click and get matched by AI."
            />
            <div className="pt-8 pb-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Discover Top Roles</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">Browse the latest opportunities on HireBricks. Sign up for free to apply with one click and get matched by AI.</p>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-2 bg-card border border-border/50 p-1.5 rounded-lg shadow-sm">
                <div className="relative flex-1 min-w-[200px] flex items-center">
                    {isLoading ? (
                        <Loader2 size={14} className="absolute left-3 text-accent animate-spin" />
                    ) : (
                        <Search size={14} className="absolute left-3 text-muted-foreground" />
                    )}
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search roles, companies, or skills..."
                        className="w-full pl-8 pr-8 py-2 rounded-md border-none bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="w-px bg-border my-1.5 hidden lg:block" />
                <div className="flex gap-2 items-center flex-1 lg:flex-none relative">
                    <Filter size={14} className="text-muted-foreground ml-3 hidden sm:block pointer-events-none" />
                    <select
                        value={workMode}
                        onChange={e => setWorkMode(e.target.value)}
                        className="w-full lg:w-40 px-3 py-2 rounded-md border-none bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none transition-all"
                    >
                        <option value="ALL">All Work Modes</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Onsite">Onsite</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 glass-card text-center">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3"><Search size={20} className="text-muted-foreground" /></div>
                    <h3 className="font-display text-lg font-bold">No jobs found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">We couldn't find any roles matching "{search}". Try adjusting your filters.</p>
                    <button onClick={() => { setSearch(''); setWorkMode('ALL'); }} className="mt-4 px-3 py-1.5 text-sm font-medium border border-border bg-background rounded-md hover:bg-muted transition-colors btn-scale">Clear Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {jobs.map((j, i) => (
                        <div key={j.id} onClick={() => navigate(`/jobs/${j.id}`)} className="cursor-pointer">
                            <JobCard
                                job={j}
                                index={i}
                                isPublic={true}
                                onApply={(id, e) => {
                                    e.stopPropagation();
                                    handleApplyClick(e);
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalJobs > pageSize && (
                <div className="flex flex-col sm:flex-row items-center justify-between py-6 mt-4 border-t border-border/50 gap-4">
                    <span className="text-sm text-muted-foreground font-medium">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalJobs)} of {totalJobs} jobs
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium border border-border bg-card rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors btn-scale"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={page >= Math.ceil(totalJobs / pageSize)}
                            className="px-4 py-2 text-sm font-medium border border-border bg-card rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors btn-scale"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicJobs;
