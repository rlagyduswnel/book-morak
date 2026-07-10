import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "이메일이 필요합니다." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const exists = data.users.some(
    (user) => user.email?.toLowerCase() === normalizedEmail
  );

  return NextResponse.json({ exists });
}
