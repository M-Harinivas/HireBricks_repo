import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Use same env as app
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    console.log("Logging in as Candidate...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'sowmithra@sdxpartners.com',
        password: '12121212'
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    console.log("Logged in!", authData.session?.access_token.substring(0, 10) + '...');

    const resFilePath = 'mock-resumes/test.pdf';

    console.log("Invoking edge function...");
    const { data, error } = await supabase.functions.invoke('parse-resume', {
        body: { filePath: resFilePath },
        headers: {
            Authorization: `Bearer ${authData.session?.access_token}`
        }
    });

    if (error) {
        console.error("Invoke Error:", error);
    } else {
        console.log("Invoke Success!", data);
    }
}

runTest();
