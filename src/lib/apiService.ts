import { supabase } from './supabaseClient';

// Helper to handle Supabase responses
const handleResponse = <T>(data: T, error: any) => {
    if (error) {
        console.error('Supabase Error:', error);
        throw new Error(error.message);
    }
    return data;
};

export const apiService = {
    // Profiles
    getProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, organizations(*)')
            .eq('id', userId)
            .single();
        return handleResponse(data, error);
    },

    updateProfile: async (userId: string, profileData: any) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId)
            .select()
            .single();
        return handleResponse(data, error);
    },

    updateOrganization: async (orgId: string, orgData: any) => {
        const { data, error } = await supabase
            .from('organizations')
            .update(orgData)
            .eq('id', orgId)
            .select()
            .single();
        return handleResponse(data, error);
    },

    // Candidate Profile Variants (Multiple Profiles)
    getCandidateProfiles: async (candidateId: string) => {
        const { data, error } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: true });
        return handleResponse(data, error);
    },

    saveCandidateProfile: async (profileData: any) => {
        // If it has an ID, update; otherwise, insert (upsert handles this if configured, but let's be explicit)
        let query;
        if (profileData.id) {
            query = supabase.from('candidate_profiles').update(profileData).eq('id', profileData.id);
        } else {
            query = supabase.from('candidate_profiles').insert(profileData);
        }
        const { data, error } = await query.select().single();
        return handleResponse(data, error);
    },

    deleteCandidateProfile: async (profileId: string) => {
        const { data, error } = await supabase
            .from('candidate_profiles')
            .delete()
            .eq('id', profileId)
            .select();
        return handleResponse(data, error);
    },

    // Jobs
    getJobs: async (filters?: any) => {
        let query = supabase.from('jobs').select('*, organizations(*), applications(count)');

        if (filters?.department) query = query.eq('department', filters.department);
        if (filters?.location) query = query.eq('location', filters.location);
        if (filters?.work_mode) query = query.eq('work_mode', filters.work_mode);
        if (filters?.organization_id) query = query.eq('organization_id', filters.organization_id);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query.order('created_at', { ascending: false });
        return handleResponse(data, error);
    },

    getPaginatedJobs: async (filters?: any, page: number = 1, pageSize: number = 24) => {
        let query = supabase.from('jobs').select('*, organizations(*)', { count: 'exact' });

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.work_mode && filters.work_mode !== 'ALL') query = query.eq('work_mode', filters.work_mode);

        if (filters?.search) {
            // Use the RPC to get a list of matching job IDs across title, company name, and skills
            const { data: matchingIdsData, error: rpcError } = await supabase
                .rpc('get_job_ids_by_search', { search_term: filters.search });

            if (!rpcError && matchingIdsData) {
                const ids = matchingIdsData.map((row: any) => row.id || row);
                if (ids.length > 0) {
                    query = query.in('id', ids);
                } else {
                    // Force an empty result if search yields no IDs but the search term exists
                    query = query.eq('id', '00000000-0000-0000-0000-000000000000');
                }
            } else {
                // Fallback to title search if the RPC fails for any reason
                console.warn('RPC failed, falling back to basic search:', rpcError);
                query = query.ilike('title', `%${filters.search}%`);
            }
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(error.message);
        }
        return { data, count };
    },

    getSimilarJobs: async (jobId: string, domain?: string, organizationId?: string) => {
        let query = supabase.from('jobs').select('*, organizations(*)').neq('id', jobId).eq('status', 'LIVE');

        if (domain) {
            const { data, error } = await query.eq('domain', domain).limit(5);
            if (!error && data && data.length >= 3) {
                return data;
            }
        }

        // Fallback to same organization if domain doesn't yield enough matches or domain is null
        if (organizationId) {
            let fallbackQuery = supabase.from('jobs').select('*, organizations(*)').neq('id', jobId).eq('status', 'LIVE').eq('organization_id', organizationId).limit(5);
            const { data: fallbackData } = await fallbackQuery;
            return fallbackData || [];
        }

        return [];
    },

    getJobById: async (jobId: string) => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*, organizations(*)')
            .eq('id', jobId)
            .single();
        return handleResponse(data, error);
    },

    closeJob: async (jobId: string) => {
        const { error: jobError } = await supabase
            .from('jobs')
            .update({ status: 'CLOSED' })
            .eq('id', jobId);
        if (jobError) return handleResponse(null, jobError);

        const { data, error: appError } = await supabase
            .from('applications')
            .update({ status: 'REJECTED' })
            .in('status', ['APPLIED', 'SHORTLISTED', 'INTERVIEW_INVITED', 'INTERVIEW_SCHEDULED', 'UNDER_REVIEW'])
            .eq('job_id', jobId)
            .select();

        return handleResponse(data, appError);
    },

    deleteJob: async (jobId: string) => {
        const { data, error } = await supabase.from('jobs').delete().eq('id', jobId).select();
        return handleResponse(data, error);
    },

    // Applications
    checkApplicationStatus: async (jobId: string, candidateId: string) => {
        const { data, error } = await supabase
            .from('applications')
            .select('id, status, applied_at')
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId)
            .maybeSingle();

        if (error) {
            console.error('Supabase Error checking application status:', error);
            return null;
        }
        return data;
    },

    getApplicationById: async (applicationId: string) => {
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                jobs(*, organizations(*)),
                profiles(*),
                candidate_profiles(*)
            `)
            .eq('id', applicationId)
            .single();
        return handleResponse(data, error);
    },

    getApplications: async (filters?: { candidate_id?: string, job_id?: string, organization_id?: string }) => {
        // Nested select allows fetching job details directly
        let query = supabase.from('applications').select(`
      *,
      jobs(*, organizations(*)),
      profiles(*)
    `);

        if (filters?.candidate_id) query = query.eq('candidate_id', filters.candidate_id);
        if (filters?.job_id) query = query.eq('job_id', filters.job_id);
        if (filters?.organization_id) query = query.eq('jobs.organization_id', filters.organization_id);

        const { data, error } = await query.order('applied_at', { ascending: false });
        return handleResponse(data, error);
    },

    createApplication: async (applicationData: any) => {
        const { data, error } = await supabase
            .from('applications')
            .insert(applicationData)
            .select()
            .single();
        return handleResponse(data, error);
    },

    updateApplicationStatus: async (applicationId: string, status: string) => {
        const { data, error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId)
            .select()
            .single();
        return handleResponse(data, error);
    },

    // Candidate Extended Data (Education, Experience, Certifications)
    getCandidateEducation: async (profileId: string) => {
        const { data, error } = await supabase.from('candidate_education').select('*').eq('profile_id', profileId);
        return handleResponse(data, error);
    },
    getCandidateExperience: async (profileId: string) => {
        const { data, error } = await supabase.from('candidate_experience').select('*').eq('profile_id', profileId);
        return handleResponse(data, error);
    },
    getCandidateCertifications: async (profileId: string) => {
        const { data, error } = await supabase.from('candidate_certifications').select('*').eq('profile_id', profileId);
        return handleResponse(data, error);
    },

    // Interviews
    getInterviews: async (filters?: { application_id?: string }) => {
        let query = supabase.from('interviews').select('*, applications(*, jobs(*, organizations(*)), profiles(*))');
        if (filters?.application_id) query = query.eq('application_id', filters.application_id);
        const { data, error } = await query.order('scheduled_at', { ascending: true });
        return handleResponse(data, error);
    },

    // Offers
    getOffers: async (filters?: { job_id?: string, candidate_id?: string }) => {
        let query = supabase.from('offers').select(`*, applications(*, jobs(*, organizations(*)), profiles(*))`);
        if (filters?.job_id) {
            query = query.eq('applications.job_id', filters.job_id);
        }
        if (filters?.candidate_id) {
            query = query.eq('applications.candidate_id', filters.candidate_id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        return handleResponse(data, error);
    },

    // Notifications
    getNotifications: async (userId: string) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return handleResponse(data, error);
    },

    markNotificationRead: async (notificationId: string) => {
        const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .select()
            .single();
        return handleResponse(data, error);
    },



    markNotificationsRead: async (userId: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId);
        return { error };
    },

    // --- Admin Endpoints --- //

    getAdminAnalytics: async () => {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        const [orgsRes, usersRes, jobsRes, offersRes, interviewsRes] = await Promise.all([
            supabase.from('organizations').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('jobs').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
            supabase.from('offers').select('*', { count: 'exact', head: true }).in('status', ['Sent', 'Accepted', 'OFFER_SENT', 'HIRED']),
            supabase.from('interviews').select('*', { count: 'exact', head: true })
        ]);

        const { data: offersData } = await supabase.from('offers').select('status, created_at, start_date, applications(jobs(created_at))');
        const { data: jobsData } = await supabase.from('jobs').select('department, applications(id, status)');
        const { data: interviewsData } = await supabase.from('interviews').select('scheduled_at, status');

        return {
            totalCompanies: orgsRes.count || 0,
            totalUsers: usersRes.count || 0,
            jobsThisMonth: jobsRes.count || 0,
            offersSent: offersRes.count || 0,
            totalInterviews: interviewsRes.count || 0,
            offersData: offersData || [],
            jobsData: jobsData || [],
            interviewsData: interviewsData || []
        };
    },

    getAdminTenants: async () => {
        const { data, error } = await supabase
            .from('organizations')
            .select(`
                *,
                profiles(id),
                jobs(id)
            `);
        return handleResponse(data, error);
    },

    getAdminUsers: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                organizations(name)
            `);
        return handleResponse(data, error);
    }
};
