import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "인증 정보가 없습니다." },
      { status: 401 }
    );
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "유효하지 않은 인증입니다." },
      { status: 401 }
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(
    userData.user.id
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
