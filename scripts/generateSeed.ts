import { writeFileSync } from 'fs';
import { JOBS, CANDIDATES, INTERVIEWS, OFFERS, NOTIFICATIONS, COMPANY } from '../src/data/mockData';

import { randomUUID } from 'crypto';
const idMap = new Map<string, string>();
idMap.set('techcorp', 'a0000000-0000-0000-0000-000000000001');
idMap.set('recruiter', 'b0000000-0000-0000-0000-000000000002');
idMap.set('c1', 'b0000000-0000-0000-0000-000000000003'); // Arjun Mehta
function toUuid(id: string): string {
    if (!idMap.has(id)) {
        idMap.set(id, randomUUID());
    }
    return idMap.get(id)!;
}

const orgId = toUuid('techcorp');
const adminId = toUuid('admin');
const recruiterId = toUuid('recruiter');

let sql = `-- Seed Database Script generated from mockData.ts
BEGIN;

-- 1. Organizations
INSERT INTO public.organizations (id, name, slug)
VALUES ('${orgId}', '${COMPANY.name}', '${COMPANY.slug}')
ON CONFLICT (id) DO NOTHING;
`;
sql += `\n-- 2. Insert Recruiter (Auth User & Profile)\n`;
sql += `INSERT INTO auth.users (id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin, is_sso_user)
VALUES ('${recruiterId}', 'authenticated', 'authenticated', 'recruiter@techcorp.in', now(), '{"provider":"email","providers":["email"]}', '{"role":"RECRUITER"}', now(), now(), false, false)
ON CONFLICT (id) DO NOTHING;\n`;
sql += `INSERT INTO public.profiles (id, email, full_name, role, organization_id)
VALUES ('${recruiterId}', 'recruiter@techcorp.in', 'Priya Sharma', 'RECRUITER', '${orgId}')
ON CONFLICT (id) DO NOTHING;

-- 3. Jobs
`;

for (const job of JOBS) {
    const jobId = toUuid(job.id);
    sql += `INSERT INTO public.jobs (id, organization_id, created_by, title, department, location, work_mode, salary_currency, status, description, skills, experience, vacancies)
VALUES ('${jobId}', '${orgId}', '${recruiterId}', '${job.title.replace(/'/g, "''")}', '${job.department}', '${job.location}', '${job.workMode}', 'INR', '${job.status}', '${job.description.replace(/'/g, "''")}', ARRAY[${job.skills.map(s => `'${s}'`).join(',')}]::text[], '${job.experience}', ${job.vacancies})
ON CONFLICT (id) DO NOTHING;\n`;
}

// 3.5 auth.users for Candidates
sql += `\n-- 3.5 Candidate Auth Users\n`;
for (const cand of CANDIDATES) {
    const candId = toUuid(cand.id);
    sql += `INSERT INTO auth.users (id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin, is_sso_user)
VALUES ('${candId}', 'authenticated', 'authenticated', '${cand.email}', now(), '{"provider":"email","providers":["email"]}', '{"role":"CANDIDATE"}', now(), now(), false, false)
ON CONFLICT (id) DO NOTHING;\n`;
}

sql += `\n-- 4. Candidate Profiles & Applications\n`;

for (const c of CANDIDATES) {
    const cId = toUuid(c.id);
    // Profile
    sql += `INSERT INTO public.profiles (id, email, full_name, role, phone, location, summary, skills)
VALUES ('${cId}', '${c.email}', '${c.name.replace(/'/g, "''")}', 'CANDIDATE', '${c.phone}', '${c.location}', '${c.summary.replace(/'/g, "''")}', ARRAY[${c.skills.map(s => `'${s.replace(/'/g, "''")}'`).join(',')}]::text[])
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;\n`;

    // Education
    for (const edu of c.education) {
        sql += `INSERT INTO public.candidate_education (profile_id, degree, institution, year)
VALUES ('${cId}', '${edu.degree.replace(/'/g, "''")}', '${edu.institution.replace(/'/g, "''")}', '${edu.year}')
ON CONFLICT DO NOTHING;\n`;
    }

    // Work History
    for (const exp of c.workHistory) {
        sql += `INSERT INTO public.candidate_experience (profile_id, title, company, duration, description)
VALUES ('${cId}', '${exp.title.replace(/'/g, "''")}', '${exp.company.replace(/'/g, "''")}', '${exp.duration}', '${exp.description.replace(/'/g, "''")}')
ON CONFLICT DO NOTHING;\n`;
    }

    // Certifications
    for (const cert of c.certifications) {
        sql += `INSERT INTO public.candidate_certifications (profile_id, name)
VALUES ('${cId}', '${cert.replace(/'/g, "''")}')
ON CONFLICT DO NOTHING;\n`;
    }

    // Applications
    const jobId = toUuid(c.jobId);
    const appId = toUuid(`app_${c.id}`);
    sql += `INSERT INTO public.applications (id, job_id, candidate_id, status, ai_score, applied_at)
VALUES ('${appId}', '${jobId}', '${cId}', '${c.status}', ${c.score}, '${c.appliedDate}')
ON CONFLICT (id) DO NOTHING;\n`;
}

sql += `\n-- 5. Interviews\n`;
for (const i of INTERVIEWS) {
    const iId = toUuid(i.id);
    const appId = toUuid(`app_${i.candidateId}`);
    // Assuming 'Scheduled' | 'Completed' | 'Cancelled' -> 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
    sql += `INSERT INTO public.interviews (id, application_id, scheduled_at, status, duration_minutes, score, proctoring_level)
VALUES ('${iId}', '${appId}', now(), '${i.status}', ${i.duration === '-' ? 'null' : parseInt(i.duration)}, ${i.score || 'null'}, ${i.proctoring ? `'${i.proctoring}'` : 'null'})
ON CONFLICT (id) DO NOTHING;\n`;
}

sql += `\n-- 6. Offers\n`;
for (const o of OFFERS) {
    const oId = toUuid(o.id);
    const appId = toUuid(`app_${o.candidateId}`);
    sql += `INSERT INTO public.offers (id, application_id, salary, start_date, status, content)
VALUES ('${oId}', '${appId}', '${o.salary}', '${o.startDate}', '${o.status}', '${o.content.replace(/'/g, "''")}')
ON CONFLICT (id) DO NOTHING;\n`;
}

sql += `\n-- 7. Notifications\n`;
for (const n of NOTIFICATIONS) {
    const nId = toUuid(n.id);
    sql += `INSERT INTO public.notifications (id, user_id, type, title, message, read)
VALUES ('${nId}', '${recruiterId}', '${n.type.toLowerCase()}', '${n.title.replace(/'/g, "''")}', '${n.message.replace(/'/g, "''")}', ${n.read})
ON CONFLICT (id) DO NOTHING;\n`;
}

sql += `COMMIT;\n`;

writeFileSync('seed.sql', sql, 'utf-8');
console.log('Successfully wrote seed.sql');
