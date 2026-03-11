# ZeptoMail Setup & Configuration Guide

This guide describes how to finalize the ZeptoMail integration for HireBricks.

## 1. ZeptoMail Dashboard Setup

### A. Add Sender Domain
1. Log in to [ZeptoMail](https://www.zoho.com/zeptomail/).
2. Verify your domain (`hirebricks.com`).
3. Set the sender email to `noreply@hirebricks.com`.

### B. Create Templates
Create exactly three templates in the ZeptoMail dashboard with the design provided in [email_templates.md](file:///C:/Users/HP%20ELITEBOOK%20G8%20AERO/.gemini/antigravity/brain/5d8f9cc3-3d8d-4e5c-bfc0-4f3e6a24a402/email_templates.md). Use the following **Template Aliases**:
1. `welcome_email`
   - **Merge Vars**: `{{full_name}}`
2. `password_reset`
   - **Merge Vars**: `{{reset_link}}`
3. `job_application_confirmed`
   - **Merge Vars**: `{{candidate_name}}`, `{{job_title}}`


## 2. Supabase Configuration

### A. Environment Variables (Secrets)
Run the following commands in your terminal or use the Supabase Dashboard (Settings -> Edge Functions):
```bash
supabase secrets set ZEPTOMAIL_API_KEY=your_api_key_here
supabase secrets set ZEPTOMAIL_BOUNCE_ADDRESS=bounce@hirebricks.com
```

### B. Configure Auth Hooks (Critical)
To replace Supabase's default Auth emails with ZeptoMail:
1. Go to **Authentication -> Hooks** in the Supabase Dashboard.
2. Click **Add Hook** for **Send Email**.
3. **IMPORTANT**: Change the **Hook type** from "Postgres" to **HTTP**.
4. **Endpoint URL**: `https://ptoxtplvetciatkkkklq.supabase.co/functions/v1/zepto-service`
5. **HTTP Method**: `POST`
6. **Authorization**: Keep it as "None" or "Bearer" (if you want to use the JWT verification, but since it's an internal hook, "None" often works for testing unless you've enforced JWT in the function).
7. Save the hook.

This will intercept all Auth emails (Signup, Reset) and route them through your ZeptoMail function.


### C. Configure Database Webhooks (Job Applications)
1. Go to **Database -> Webhooks**.
2. Create a new Webhook:
   - **Name**: `send_application_email`
   - **Table**: `applications`
   - **Events**: `INSERT`
   - **Type**: `Supabase Edge Function`
   - **Function**: `zepto-service`
   - **Payload**: Choose "Custom" if you want to map specific fields, or keep default to parse the `NEW` record in the edge function.

## 3. Verification
1. **Signup**: Create a new account. You should receive the `welcome_email`.
2. **Password Reset**: Use the "Forgot Password" link. You should receive the `password_reset` email.
3. **Job Application**: Apply for any job as a candidate. You should receive the `job_application_confirmed` email.

---
**Need help?** Contact ZeptoMail support or check the [ZeptoMail API Documentation](https://www.zoho.com/zeptomail/help/api/templates.html).
