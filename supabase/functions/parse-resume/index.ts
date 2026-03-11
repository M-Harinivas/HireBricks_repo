import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ─── SECTION KEYWORDS for heuristic detection ───
const SECTION_PATTERNS: Record<string, RegExp> = {
    summary: /^(summary|objective|professional\s*summary|career\s*summary|about\s*me|profile|professional\s*profile|introduction)/i,
    experience: /^(experience|work\s*experience|employment|work\s*history|professional\s*experience|career\s*history|employment\s*history|internships?)/i,
    education: /^(education|academic|qualifications|educational\s*background|academic\s*background|academic\s*qualifications)/i,
    skills: /^(skills|technical\s*skills|core\s*competencies|competencies|key\s*skills|areas\s*of\s*expertise|technologies|tech\s*stack|proficiencies)/i,
    certifications: /^(certifications?|licenses?|credentials|professional\s*certifications?)/i,
    projects: /^(projects|key\s*projects|notable\s*projects|personal\s*projects|academic\s*projects)/i,
    languages: /^(languages|language\s*proficiency|linguistic\s*skills)/i,
    // Discard sections that cause bleed
    discard: /^(achievements|awards|workshops|hobbies|interests|references|publications|volunteer|extra[\\/-]?curricular)/i,
};

// ─── REGEX PATTERNS ───
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/;
const URL_RE = /https?:\/\/[^\s,]+/g;
const LINKEDIN_RE = /(?:linkedin\.com\/in\/[\w-]+|linkedin:\s*[\w-]+)/i;

// Date range patterns
const DATE_RANGE_RE = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow|[Oo]ngoing)/i;

// Degree patterns
const DEGREE_RE = /\b(?:B\.?\s*(?:Tech|Sc|A|E|Com|Arch|Des|Pharm)|M\.?\s*(?:Tech|Sc|A|E|Com|BA|Des|Pharm)|Ph\.?\s*D|MBA|BBA|BCA|MCA|BE|ME|B\.?Ed|M\.?Ed|LLB|LLM|MBBS|MD|MS|Bachelor|Master|Diploma|Associate|Doctorate|Post\s*Graduate|Under\s*Graduate)\b/i;

// Common Spoken Languages
const SPOKEN_LANGUAGES = [
    "english", "spanish", "mandarin", "hindi", "arabic", "portuguese", "bengali", "russian", "japanese",
    "punjabi", "german", "javanese", "wu", "malay", "telugu", "vietnamese", "korean", "french",
    "marathi", "tamil", "urdu", "turkish", "italian", "yue", "thai", "gujarati", "jin", "southern min",
    "persian", "polish", "pashto", "kannada", "xiang", "malayalam", "sundanese", "hausa", "odia",
    "burmese", "hakka", "ukrainian", "bhojpuri", "tagalog", "yoruba", "maithili", "uzbek", "sindhi",
    "amharic", "fula", "romanian", "oromo", "igbo", "azerbaijani", "awadhi", "gan", "cebuano", "dutch",
    "kurdish", "serbo-croatian", "malagasy", "saraiki", "nepali", "sinhalese", "chittagonian", "zhuang",
    "khmer", "turkmen", "assamese", "madurese", "somali", "marwari", "magahi", "haryanvi", "hungarian",
    "chhattisgarhi", "greek", "chewa", "deccan", "akan", "kazakh", "northern min", "sylheti", "zulu",
    "czech", "kinyarwanda", "dhundhari", "haitian creole", "eastern min", "ilocano", "quechua", "kirundi",
    "swedish", "hmong", "shona", "uyghur", "hiligaynon", "mossi", "xhosa", "belarusian", "balochi", "konkani"
];

// Common Technical Languages (to filter out of spoken languages into skills)
const TECH_LANGUAGES = [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "php", "swift",
    "kotlin", "rust", "dart", "scala", "perl", "haskell", "lua", "sql", "html", "css", "bash"
];

// ─── HELPERS ───
function isLikelySectionHeader(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.length > 80) return false;
    const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]{3,}/.test(trimmed);
    const endsWithColon = trimmed.endsWith(':');
    const matchesPattern = Object.values(SECTION_PATTERNS).some(p => p.test(trimmed.replace(/:$/, '')));
    return matchesPattern || (isAllCaps && trimmed.split(/\s+/).length <= 5) || (endsWithColon && trimmed.split(/\s+/).length <= 5);
}

function classifySection(line: string): string | null {
    const cleaned = line.trim().replace(/[:_\-=]+$/, '').trim();
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(cleaned)) return section;
    }
    return null;
}

function extractBulletContent(line: string): string {
    return line.replace(/^[\s•●○◦▪▸►\-\*>]+/, '').replace(/^\d+\.\s*/, '').trim();
}

function normalizeLines(lines: string[]): string[] {
    // Merge orphaned lines that don't look like they start a new point
    const merged: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const isBulletStarted = /^[•●○◦▪▸►\-\*>]/.test(line) || /^\d+\.\s+/.test(line);
        const prevLineEndPreposition = merged.length > 0 && /(by|at|in|on|to|for|with|of|and|&)\s*$/i.test(merged[merged.length - 1]);

        if (!isBulletStarted && merged.length > 0 && (prevLineEndPreposition || line.split(' ').length <= 4)) {
            // It's likely a continuation, especially if it doesn't have a date or location pattern
            if (!DATE_RANGE_RE.test(line)) {
                merged[merged.length - 1] += ' ' + line;
                continue;
            }
        }
        merged.push(line);
    }
    return merged;
}

// ─── MAIN PARSER ───
function parseResumeText(text: string) {
    const lines = text.split(/\n/).map(l => l.replace(/\r/, ''));

    const result = {
        name: '' as string,
        email: '' as string,
        phone: '' as string,
        location: '' as string,
        summary: '' as string,
        linkedin: '' as string,
        skills: [] as string[],
        education: [] as { degree: string; institution: string; year: string }[],
        experience: [] as { title: string; company: string; duration: string; description: string }[],
        certifications: [] as { name: string; issuer: string }[],
        projects: [] as { name: string; description: string; technologies: string[]; url: string; duration: string }[],
        languages: [] as { language: string; proficiency: string }[],
    };

    const fullText = text;
    const emailMatch = fullText.match(EMAIL_RE);
    if (emailMatch) result.email = emailMatch[0].toLowerCase();

    const phoneMatch = fullText.match(PHONE_RE);
    if (phoneMatch) result.phone = phoneMatch[0].trim();

    const linkedinMatch = fullText.match(LINKEDIN_RE);
    if (linkedinMatch) result.linkedin = linkedinMatch[0];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (EMAIL_RE.test(trimmed)) continue;
        if (PHONE_RE.test(trimmed) && trimmed.replace(PHONE_RE, '').trim().length < 3) continue;
        if (isLikelySectionHeader(trimmed)) break;
        const words = trimmed.split(/\s+/);
        if (words.length >= 1 && words.length <= 6 && words.every(w => /^[A-Za-z.'-]+$/.test(w))) {
            result.name = trimmed;
            break;
        }
    }

    const headerLines = lines.slice(0, 15);
    for (const line of headerLines) {
        const trimmed = line.trim();
        if (/[A-Z][a-z]+(?:,\s*[A-Z]{2}|,\s*[A-Z][a-z]+|\s*[-–]\s*[A-Z][a-z]+)/.test(trimmed)) {
            if (trimmed !== result.name && !EMAIL_RE.test(trimmed)) {
                const locMatch = trimmed.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?(?:,\s*(?:[A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?))?(?:\s*[-–]\s*[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)?)/);
                if (locMatch) result.location = locMatch[1];
                break;
            }
        }
    }

    const sections: { type: string; lines: string[] }[] = [];
    let currentSection: { type: string; lines: string[] } | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (currentSection) currentSection.lines.push('');
            continue;
        }

        if (isLikelySectionHeader(trimmed)) {
            const sectionType = classifySection(trimmed);
            if (sectionType) {
                if (currentSection) sections.push(currentSection);
                currentSection = { type: sectionType, lines: [] };
                continue;
            }
        }

        if (currentSection) {
            currentSection.lines.push(trimmed);
        }
    }
    if (currentSection) sections.push(currentSection);

    for (const section of sections) {
        if (section.type === 'discard') continue;

        const mergedLines = normalizeLines(section.lines);
        const sectionText = section.lines.join('\n');

        switch (section.type) {
            case 'summary': {
                // Just extract text
                result.summary = section.lines.filter(l => l.trim() && !isLikelySectionHeader(l)).join(' ').trim();
                break;
            }

            case 'skills': {
                const allText = section.lines.join(' ');
                let skills: string[] = [];

                // Split aggressively on multiple spaces (tables), commas, pipes, 'and', '&'
                const splitRegex = /\s{2,}|[,;|•●○◦▪▸►\-\*]|\b(?:and|&)\b/i;
                skills = allText.split(splitRegex).map(s => s.trim()).filter(s => s.length > 0);

                // Filter out conversational sentences (over 40 chars usually means it's a paragraph, not a skill)
                skills = skills.filter(s => s.length < 40 && s.split(' ').length <= 4);

                // Remove known prefixes
                skills = skills.map(s => s.replace(/^[^:]+:\s*/, '').trim()).filter(s => s.length > 1);

                result.skills = [...new Set([...result.skills, ...skills])];
                break;
            }

            case 'education': {
                const entries: { degree: string; institution: string; year: string }[] = [];
                let current = { degree: '', institution: '', year: '' };

                for (const line of mergedLines) {
                    const clean = extractBulletContent(line);
                    if (!clean) continue;

                    const degreeMatch = clean.match(DEGREE_RE);
                    const yearMatch = clean.match(/\b(19|20)\d{2}\b/g);
                    const dateRangeMatch = clean.match(DATE_RANGE_RE);

                    if (degreeMatch) {
                        if (current.degree || current.institution) {
                            entries.push({ ...current });
                            current = { degree: '', institution: '', year: '' };
                        }
                        current.degree = clean.replace(dateRangeMatch?.[0] || '', '').trim();
                        if (dateRangeMatch) current.year = dateRangeMatch[0];
                        else if (yearMatch) current.year = yearMatch[yearMatch.length - 1];
                    } else if (yearMatch && !current.year) {
                        current.year = dateRangeMatch?.[0] || yearMatch[yearMatch.length - 1];
                        if (!current.institution) current.institution = clean.replace(dateRangeMatch?.[0] || yearMatch[yearMatch.length - 1], '').trim();
                    } else if (!current.institution && clean.length > 3) {
                        current.institution = clean.replace(dateRangeMatch?.[0] || '', '').trim();
                        if (dateRangeMatch && !current.year) current.year = dateRangeMatch[0];
                    }
                }
                if (current.degree || current.institution) entries.push(current);
                result.education = entries;
                break;
            }

            case 'experience': {
                const entries: { title: string; company: string; duration: string; description: string }[] = [];
                let current = { title: '', company: '', duration: '', descLines: [] as string[] };

                for (const line of mergedLines) {
                    const clean = extractBulletContent(line);
                    if (!clean || isLikelySectionHeader(clean)) continue;

                    const dateRangeMatch = clean.match(DATE_RANGE_RE);

                    if (dateRangeMatch && !clean.startsWith('•') && !clean.startsWith('-')) {
                        if (current.title && current.duration) {
                            entries.push({ title: current.title, company: current.company, duration: current.duration, description: current.descLines.join(' ') });
                            current = { title: '', company: '', duration: '', descLines: [] };
                        }
                        current.duration = dateRangeMatch[0];
                        // Usually format is "Company, Location, Date" or "Title at Company Date"
                        let remaining = clean.replace(dateRangeMatch[0], '').replace(/[|–—,\-]\s*$/, '').replace(/^\s*[|–—,\-]/, '').trim();

                        // Try to split remaining into Title and Company
                        const parts = remaining.split(/(?: at |,| - | – | \| )/);
                        if (parts.length > 1) {
                            current.company = parts[0].trim();
                            current.title = parts[1].trim();
                            // Swap if title looks like a company
                            if (current.company.length > current.title.length) {
                                const temp = current.title;
                                current.title = current.company;
                                current.company = temp;
                            }
                        } else if (remaining) {
                            if (!current.title) current.title = remaining;
                            else if (!current.company) current.company = remaining;
                        }
                    } else if (!current.title && clean.length < 80 && !clean.match(/^[•\-*]/)) {
                        current.title = clean;
                    } else if (current.title && !current.company && !dateRangeMatch && clean.length < 80 && !clean.match(/^[•\-*]/)) {
                        current.company = clean;
                    } else {
                        current.descLines.push(clean);
                    }
                }
                if (current.title || current.company) {
                    entries.push({ title: current.title, company: current.company, duration: current.duration, description: current.descLines.join(' ') });
                }
                result.experience = entries;
                break;
            }

            case 'certifications': {
                const entries: { name: string; issuer: string }[] = [];
                for (const line of mergedLines) {
                    const clean = extractBulletContent(line);
                    if (!clean || clean.length < 3 || isLikelySectionHeader(clean)) continue;

                    let name = clean;
                    let issuer = '';

                    const dateMatch = name.match(DATE_RANGE_RE) || name.match(/\b(?:19|20)\d{2}\b/);
                    if (dateMatch) {
                        name = name.replace(dateMatch[0], '').trim();
                    }

                    // Extract issuer using keywords "offered by", "from", "by", "-"
                    const splitParts = name.split(/\s+(?:offered by|certified by|from|by| - | – | \| )\s+/i);
                    if (splitParts.length > 1) {
                        name = splitParts[0].trim();
                        issuer = splitParts[1].trim();
                    }

                    // Clean up trailing commas/hyphens
                    name = name.replace(/[,|\-–]$/, '').trim();
                    issuer = issuer.replace(/[,|\-–]$/, '').trim();

                    entries.push({ name, issuer });
                }
                result.certifications = entries;
                break;
            }

            case 'projects': {
                const entries: { name: string; description: string; technologies: string[]; url: string; duration: string }[] = [];
                let current = { name: '', description: '', technologies: [] as string[], url: '', duration: '' };

                for (const line of section.lines) {
                    const clean = extractBulletContent(line);
                    if (!clean || isLikelySectionHeader(clean)) continue;

                    const urlMatch = clean.match(URL_RE);
                    const dateRangeMatch = clean.match(DATE_RANGE_RE);
                    const techMatch = clean.match(/(?:Technologies?|Tech\s*Stack|Built\s*with|Tools?)\s*[:\-]\s*(.+)/i);

                    if (dateRangeMatch && !current.name) {
                        current.duration = dateRangeMatch[0];
                        const remaining = clean.replace(dateRangeMatch[0], '').trim();
                        if (remaining) current.name = remaining;
                    } else if (!current.name && clean.length < 80 && !clean.match(/^[•\-*]/)) {
                        current.name = clean;
                        if (dateRangeMatch) current.duration = dateRangeMatch[0];
                    } else if (techMatch) {
                        current.technologies = techMatch[1].split(/[,;|]/).map(t => t.trim()).filter(t => t.length > 0);
                    } else if (urlMatch) {
                        current.url = urlMatch[0];
                    } else if (clean.match(/^[•\-*]/) || current.name) {
                        current.description += (current.description ? ' ' : '') + clean;
                    }
                }
                if (current.name) entries.push(current);
                result.projects = entries;
                break;
            }

            case 'languages': {
                const allText = section.lines.join(' ');
                const textLower = allText.toLowerCase();
                const langEntries: { language: string; proficiency: string }[] = [];

                // 1. Look for spoken languages
                for (const lang of SPOKEN_LANGUAGES) {
                    const regex = new RegExp(`\\b${lang}\\b`, 'i');
                    if (regex.test(allText)) {
                        // If we find it, try to see if it has a proficiency next to it like "English (Fluent)"
                        let proficiency = 'Conversational';
                        const profMatch = new RegExp(`\\b${lang}\\b\\s*[:(\\-–]\\s*([A-Za-z]+)`, 'i').exec(allText);
                        if (profMatch && profMatch[1]) proficiency = profMatch[1];
                        else if (textLower.includes("native") && regex.test(textLower)) proficiency = "Native";
                        else if (textLower.includes("fluent") && regex.test(textLower)) proficiency = "Fluent";

                        langEntries.push({ language: lang.charAt(0).toUpperCase() + lang.slice(1), proficiency });
                    }
                }

                // 2. Look for technical languages and push them to skills
                const foundTechSkills: string[] = [];
                for (const tech of TECH_LANGUAGES) {
                    const regex = new RegExp(`\\b${tech.replace('+', '\\+')}\\b`, 'i');
                    if (regex.test(allText)) {
                        foundTechSkills.push(tech.charAt(0).toUpperCase() + tech.slice(1));
                    }
                }

                if (foundTechSkills.length > 0) {
                    result.skills = [...new Set([...result.skills, ...foundTechSkills])];
                }

                result.languages = langEntries;
                break;
            }
        }
    }

    return result;
}

// ─── EDGE FUNCTION HANDLER ───
Deno.serve(async (req: Request) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { filePath } = await req.json();
        if (!filePath) {
            return new Response(JSON.stringify({ error: 'filePath is required' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('resumes')
            .download(filePath);

        if (downloadError || !fileData) {
            return new Response(JSON.stringify({ error: 'Failed to download file: ' + (downloadError?.message || 'unknown') }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // Determine file type
        const ext = filePath.split('.').pop()?.toLowerCase();
        let extractedText = '';

        if (ext === 'pdf') {
            try {
                const pdftotext = await import('npm:pdf-parse@1.1.1');
                const pdfParse = pdftotext.default || pdftotext;
                const buffer = await fileData.arrayBuffer();

                // Edge Runtime compat for Buffer
                const { Buffer } = await import('node:buffer');
                const pdfData = await pdfParse(Buffer.from(buffer));
                extractedText = pdfData.text;
            } catch (err) {
                console.warn("pdf-parse failed, falling back to basic extraction", err);
                return new Response(JSON.stringify({ error: 'PDF parsing failed on server' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
            }
        } else if (ext === 'docx') {
            try {
                const mammothModule = await import('npm:mammoth@1.8.0');
                const mammoth = mammothModule.default || mammothModule;
                const arrayBuffer = await fileData.arrayBuffer();

                // Edge Runtime compat for Buffer
                const { Buffer } = await import('node:buffer');

                // Extract raw text
                const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
                extractedText = result.value;
            } catch (err) {
                console.warn("mammoth failed", err);
                return new Response(JSON.stringify({ error: 'DOCX parsing failed on server' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
            }
        } else if (ext === 'doc') {
            extractedText = await fileData.text();
        } else {
            return new Response(JSON.stringify({ error: 'Unsupported file format: ' + ext }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        if (!extractedText || extractedText.trim().length < 20) {
            return new Response(JSON.stringify({ error: 'Could not extract text from resume. The file may be image-based or corrupted.' }), { status: 422, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // Parse the extracted text
        const parsed = parseResumeText(extractedText);

        return new Response(JSON.stringify({ success: true, data: parsed, rawTextLength: extractedText.length }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        console.error('Parse resume error:', error);
        return new Response(JSON.stringify({ error: 'Internal error: ' + (error instanceof Error ? error.message : String(error)) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
