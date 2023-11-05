"use server";

import { env } from "@/env.mjs";
import {
  createBankAccounts,
  updateSimilarTransactions,
  updateTransaction,
} from "@midday/supabase/mutations";
import { createClient } from "@midday/supabase/server";
import { revalidateTag } from "next/cache";

const baseUrl = "https://api.resend.com";

export async function sendFeeback(formData: FormData) {
  const supabase = await createClient();
  const feedback = formData.get("feedback");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${baseUrl}/email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "feedback@midday.ai",
      to: "pontus@lostisland.co",
      subject: "Feedback",
      text: `${feedback} \nName: ${session?.user?.user_metadata?.name} \nEmail: ${session?.user?.email}`,
    }),
  });

  const json = await res.json();

  return json;
}

export async function subscribeEmail(formData: FormData, userGroup: string) {
  const email = formData.get("email");

  const res = await fetch(env.LOOPS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, userGroup }),
  });

  const json = await res.json();

  return json;
}

export async function createBankAccountsAction(accounts) {
  const supabase = await createClient();
  return createBankAccounts(supabase, accounts);
}

export async function updateTransactionAction(id: string, payload: any) {
  const supabase = await createClient();
  const { data } = await updateTransaction(supabase, id, payload);
  revalidateTag(`transactions-${data.team_id}`);
}

export async function updateSimilarTransactionsAction(id: string) {
  const supabase = await createClient();
  const data = await updateSimilarTransactions(supabase, id);
  revalidateTag(`transactions-${data.team_id}`);
}
