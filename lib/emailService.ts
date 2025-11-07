import { getSupabase } from './supabaseClient';

export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateEmailNotificationStatus(
  notificationId: string, 
  status: 'sent' | 'failed', 
  errorMessage?: string
) {
  const supabase = getSupabase();
  
  const updateData: any = { 
    status,
    sent_at: status === 'sent' ? new Date().toISOString() : null
  };
  
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('email_notifications')
    .update(updateData)
    .eq('id', notificationId);

  if (error) {
    console.error('Error updating email notification:', error);
  }
}

export async function processPendingEmails() {
  const supabase = getSupabase();
  
  // Ambil email yang pending
  const { data: pendingEmails, error } = await supabase
    .from('email_notifications')
    .select('*')
    .eq('status', 'pending')
    .limit(10);

  if (error) {
    console.error('Error fetching pending emails:', error);
    return;
  }

  for (const email of pendingEmails || []) {
    try {
      const result = await sendEmail({
        to: email.email_to,
        subject: email.subject,
        text: email.content,
      });

      if (result.success) {
        await updateEmailNotificationStatus(email.id, 'sent');
        console.log(`Email sent successfully to ${email.email_to}`);
      } else {
        await updateEmailNotificationStatus(email.id, 'failed', result.error);
        console.error(`Failed to send email to ${email.email_to}:`, result.error);
      }
    } catch (error: any) {
      await updateEmailNotificationStatus(email.id, 'failed', error.message);
      console.error(`Error processing email ${email.id}:`, error);
    }
  }
}