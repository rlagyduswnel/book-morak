// ⚠️ 서버 전용 파일입니다.
// SUPABASE_SECRET_KEY는 관리자 권한 키라서, "use client" 컴포넌트나
// 브라우저에서 실행되는 코드에서는 절대 이 파일을 import하면 안 됩니다.
// API Route(app/api/**/route.ts) 같은 서버 코드에서만 사용하세요.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
