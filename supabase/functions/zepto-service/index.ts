import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// ── Configuration ──
const ZEPTOMAIL_API_KEY = Deno.env.get("ZEPTOMAIL_API_KEY");
const BOUNCE_ADDRESS = Deno.env.get("ZEPTOMAIL_BOUNCE_ADDRESS") || "";
const SENDER_EMAIL = "noreply@hirebricks.com";
const SENDER_NAME = "HireBricks";
const SEND_EMAIL_HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

// Template keys from ZeptoMail dashboard (set as Supabase secrets)
// These are the long system-generated keys like "2518b.11f70b2c2c7a2bdc.k1.xxxxx"
const TEMPLATE_KEY_WELCOME = Deno.env.get("ZEPTOMAIL_TEMPLATE_KEY_WELCOME") || "";
const TEMPLATE_KEY_PASSWORD_RESET = Deno.env.get("ZEPTOMAIL_TEMPLATE_KEY_PASSWORD_RESET") || "";
const TEMPLATE_KEY_JOB_CONFIRMATION = Deno.env.get("ZEPTOMAIL_TEMPLATE_KEY_JOB_CONFIRMATION") || "";

// Maps auth action types to template keys
function getTemplateKey(action: string): string {
    const map: Record<string, string> = {
        signup: TEMPLATE_KEY_WELCOME,
        signup_confirmation: TEMPLATE_KEY_WELCOME,
        recovery: TEMPLATE_KEY_PASSWORD_RESET,
        email_change: TEMPLATE_KEY_WELCOME,
        magiclink: TEMPLATE_KEY_WELCOME,
        invite: TEMPLATE_KEY_WELCOME,
    };
    return map[action] || TEMPLATE_KEY_WELCOME;
}

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, Authorization, webhook-id, webhook-timestamp, webhook-signature",
};

/**
 * Send email via ZeptoMail India API.
 * Returns { success, report } — never throws.
 */
async function sendViaZeptoMail(
    authHeaderValue: string,
    zeptoPayload: Record<string, unknown>
): Promise<{ success: boolean; report: unknown[] }> {
    const report: unknown[] = [];
    const apiUrl = "https://api.zeptomail.in/v1.1/email/template";

    console.log(`[ZeptoMail] Sending to: ${apiUrl}`);
    console.log(`[ZeptoMail] Payload:`, JSON.stringify(zeptoPayload));

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authHeaderValue,
            },
            body: JSON.stringify(zeptoPayload),
        });

        const status = response.status;
        const text = await response.text();
        console.log(`[ZeptoMail] Response: status=${status}, body=${text}`);

        if (status < 300) {
            return { success: true, report: [{ status, body: text }] };
        }
        report.push({ status, body: text });
    } catch (e) {
        const errMsg = (e as Error).message;
        console.error(`[ZeptoMail] Fetch error:`, errMsg);
        report.push({ error: errMsg });
    }

    return { success: false, report };
}

Deno.serve(async (req: Request) => {
    // ── CORS preflight ──
    if (req.method === "OPTIONS") {
        return new Response(JSON.stringify({}), {
            status: 200,
            headers: CORS_HEADERS,
        });
    }

    const reqId = Math.random().toString(36).substring(7);
    console.log(`[${reqId}] ${req.method} request received`);
    console.log(`[${reqId}] Config: HOOK_SECRET=${SEND_EMAIL_HOOK_SECRET ? "SET" : "NOT_SET"}, WELCOME_KEY=${TEMPLATE_KEY_WELCOME ? "SET" : "NOT_SET"}, RESET_KEY=${TEMPLATE_KEY_PASSWORD_RESET ? "SET" : "NOT_SET"}`);

    try {
        if (!ZEPTOMAIL_API_KEY) {
            throw new Error("ZEPTOMAIL_API_KEY is not set in Supabase Secrets");
        }

        // Clean API key
        const rawKey = ZEPTOMAIL_API_KEY.replace(/^Zoho-encz[a-z]+\s+/i, "").trim();
        const authHeaderValue = `Zoho-enczapikey ${rawKey}`;

        let to_email = "";
        let to_name: string | undefined;
        let template_key = "";
        let merge_info: Record<string, unknown> = {};
        let isAuthHook = false;

        // ── Path 1: Supabase Auth Hook (Send Email) ──
        if (req.method === "POST" && SEND_EMAIL_HOOK_SECRET) {
            const payload = await req.text();
            const headers = Object.fromEntries(req.headers);

            if (headers["webhook-id"] && headers["webhook-signature"]) {
                isAuthHook = true;
                console.log(`[${reqId}] Auth Hook path — verifying webhook signature`);

                const hookSecret = SEND_EMAIL_HOOK_SECRET.replace("v1,whsec_", "");
                const wh = new Webhook(hookSecret);

                let verified: {
                    user: { email: string; user_metadata?: { full_name?: string } };
                    email_data: {
                        token: string;
                        token_hash: string;
                        redirect_to: string;
                        email_action_type: string;
                        site_url: string;
                        token_new: string;
                        token_hash_new: string;
                    };
                };

                try {
                    verified = wh.verify(payload, headers) as typeof verified;
                    console.log(`[${reqId}] Webhook verification SUCCESS`);
                } catch (verifyError) {
                    console.error(`[${reqId}] Webhook verification FAILED:`, (verifyError as Error).message);
                    return new Response(
                        JSON.stringify({
                            error: {
                                http_code: 401,
                                message: "Webhook signature verification failed",
                            },
                        }),
                        { status: 401, headers: CORS_HEADERS }
                    );
                }

                const { user, email_data } = verified;
                to_email = user.email;
                to_name = user.user_metadata?.full_name || to_email;
                template_key = getTemplateKey(email_data.email_action_type);

                if (email_data.email_action_type === "recovery") {
                    const sep = email_data.redirect_to?.includes("?") ? "&" : "?";
                    merge_info = {
                        reset_link: `${email_data.redirect_to}${sep}token=${email_data.token_hash}`,
                        full_name: to_name,
                    };
                } else {
                    merge_info = { full_name: to_name };
                }

                console.log(
                    `[${reqId}] Auth Hook: action=${email_data.email_action_type}, to=${to_email}, template_key=${template_key ? template_key.substring(0, 20) + "..." : "EMPTY"}`
                );

                if (!template_key) {
                    console.error(`[${reqId}] Template key is EMPTY for action: ${email_data.email_action_type}. Set the ZEPTOMAIL_TEMPLATE_KEY_* secrets.`);
                    // Return 200 so signup isn't blocked
                    return new Response(JSON.stringify({}), {
                        status: 200,
                        headers: CORS_HEADERS,
                    });
                }
            } else {
                // POST but no webhook headers — try direct call path
                console.log(`[${reqId}] POST without webhook headers — direct call path`);
                try {
                    const body = JSON.parse(payload);
                    if (body.table === "applications" && body.type === "INSERT") {
                        const record = body.record;
                        const supabase = createClient(
                            Deno.env.get("SUPABASE_URL") ?? "",
                            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
                        );
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("email, full_name")
                            .eq("id", record.candidate_id)
                            .single();
                        const { data: job } = await supabase
                            .from("jobs")
                            .select("title")
                            .eq("id", record.job_id)
                            .single();
                        if (profile) {
                            to_email = profile.email;
                            to_name = profile.full_name;
                            template_key = TEMPLATE_KEY_JOB_CONFIRMATION;
                            merge_info = {
                                candidate_name: to_name || "Candidate",
                                job_title: job?.title || "the position",
                            };
                        }
                    } else if (body.to_email) {
                        to_email = body.to_email;
                        to_name = body.to_name;
                        template_key = body.template_key || body.template_id || "";
                        merge_info = body.merge_info || {};
                    }
                } catch (jsonErr) {
                    console.error(`[${reqId}] Failed to parse direct POST:`, (jsonErr as Error).message);
                }
            }
        } else if (req.method === "POST") {
            // POST without SEND_EMAIL_HOOK_SECRET set
            const body = await req.json();
            if (body.table === "applications" && body.type === "INSERT") {
                const record = body.record;
                const supabase = createClient(
                    Deno.env.get("SUPABASE_URL") ?? "",
                    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
                );
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("email, full_name")
                    .eq("id", record.candidate_id)
                    .single();
                const { data: job } = await supabase
                    .from("jobs")
                    .select("title")
                    .eq("id", record.job_id)
                    .single();
                if (profile) {
                    to_email = profile.email;
                    to_name = profile.full_name;
                    template_key = TEMPLATE_KEY_JOB_CONFIRMATION;
                    merge_info = {
                        candidate_name: to_name || "Candidate",
                        job_title: job?.title || "the position",
                    };
                }
            } else if (body.to_email) {
                to_email = body.to_email;
                to_name = body.to_name;
                template_key = body.template_key || body.template_id || "";
                merge_info = body.merge_info || {};
            }
        }

        // ── Path 3: GET request (test endpoint) ──
        if (req.method === "GET") {
            const url = new URL(req.url);
            to_email = url.searchParams.get("to") || "";
            template_key = url.searchParams.get("template_key") || url.searchParams.get("template") || TEMPLATE_KEY_WELCOME;
            to_name = url.searchParams.get("name") || to_email;
            merge_info = {
                full_name: to_name,
                candidate_name: to_name,
                job_title: "Test Job",
            };
        }

        // ── Validation ──
        if (!to_email || !template_key) {
            if (isAuthHook) {
                console.warn(`[${reqId}] Missing email/template_key — returning 200 to not block signup`);
                return new Response(JSON.stringify({}), {
                    status: 200,
                    headers: CORS_HEADERS,
                });
            }
            throw new Error(`Missing: to_email='${to_email}', template_key='${template_key ? template_key.substring(0, 20) + "..." : "EMPTY"}'`);
        }

        // Build ZeptoMail payload
        // merge_info MUST be at the top level, NOT inside each recipient
        // bounce_address is only included if ZEPTOMAIL_BOUNCE_ADDRESS env var is set
        const zeptoPayload: Record<string, unknown> = {
            template_key,
            from: { address: SENDER_EMAIL, name: SENDER_NAME },
            to: [
                {
                    email_address: { address: to_email, name: to_name || to_email },
                },
            ],
            merge_info,
        };

        // Only include bounce_address if explicitly configured
        if (BOUNCE_ADDRESS) {
            zeptoPayload.bounce_address = BOUNCE_ADDRESS;
        }

        // ── Send email ──
        const { success, report } = await sendViaZeptoMail(
            authHeaderValue,
            zeptoPayload
        );

        if (success) {
            console.log(`[${reqId}] ✅ Email sent to ${to_email}`);
            return new Response(JSON.stringify({}), {
                status: 200,
                headers: CORS_HEADERS,
            });
        }

        // ── ZeptoMail failed ──
        console.error(`[${reqId}] ❌ ZeptoMail failed:`, JSON.stringify(report));

        if (isAuthHook) {
            console.warn(`[${reqId}] Auth Hook: ZeptoMail failed but returning 200`);
            return new Response(JSON.stringify({}), {
                status: 200,
                headers: CORS_HEADERS,
            });
        }

        return new Response(
            JSON.stringify({
                error: "ZeptoMail API rejected the request",
                attempts: report,
                diagnostics: {
                    template_key: template_key.substring(0, 20) + "...",
                    key_length: rawKey.length,
                },
            }),
            { status: 500, headers: CORS_HEADERS }
        );
    } catch (error) {
        const errMsg = (error as Error).message;
        console.error(`[${reqId}] Fatal Error: ${errMsg}`);
        return new Response(JSON.stringify({ error: errMsg, reqId }), {
            status: 500,
            headers: CORS_HEADERS,
        });
    }
});
