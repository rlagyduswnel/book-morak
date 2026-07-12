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

  const matchedUser = data.users.find(
    (user) => user.email?.toLowerCase() === normalizedEmail
  );

  if (!matchedUser) {
    return NextResponse.json({ exists: false });
  }

  // auth 계정은 signUp() 호출 시점에 바로 생겨요. 하지만 우리 기준으로
  // "가입 완료"는 계정 생성(닉네임/비밀번호) 단계까지 끝내서 profiles
  // 행이 만들어진 경우예요. 그래서 profiles 행이 있는지로 판단해요.
  // (중간에 실패해서 auth 계정만 남아도 다시 시도할 수 있게 해줘요.)
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", matchedUser.id)
    .maybeSingle();

  return NextResponse.json({ exists: Boolean(profile) });
}
