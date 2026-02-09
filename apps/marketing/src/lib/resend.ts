import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// Until you verify a domain, Resend only sends from onboarding@resend.dev
export const FROM_EMAIL = 'ClubVantage <onboarding@resend.dev>';

// Where team notifications go
export const TEAM_EMAIL = 'hello@clubvantage.io';
