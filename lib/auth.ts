import { supabase } from "./supabaseClient";

export type Profile = {
  id: string;
  nickname: string;
  tag: string;
  bio: string;
  profileImage: string | null;
};

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, tag, bio, profile_image")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    nickname: data.nickname,
    tag: data.tag,
    bio: data.bio,
    profileImage: data.profile_image,
  };
}

export async function signUpWithEmail({
  email,
  password,
  nickname,
  tag,
  profileImage,
}: {
  email: string;
  password: string;
  nickname: string;
  tag: string;
  profileImage?: string | null;
}) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    throw error ?? new Error("회원가입에 실패했습니다.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    nickname,
    tag,
    profile_image: profileImage ?? null,
  });

  if (profileError) throw profileError;

  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
