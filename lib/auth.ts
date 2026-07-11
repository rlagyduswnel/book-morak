import { supabase } from "./supabaseClient";
import { uploadAvatar } from "./storage";

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

export async function fetchProfileById(
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, tag, bio, profile_image")
    .eq("id", userId)
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

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return fetchProfileById(user.id);
}

export async function signUpWithEmail({
  email,
  password,
  nickname,
  tag,
  profileImageFile,
}: {
  email: string;
  password: string;
  nickname: string;
  tag: string;
  profileImageFile?: File | null;
}) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    throw error ?? new Error("회원가입에 실패했습니다.");
  }

  let profileImageUrl: string | null = null;

  if (profileImageFile) {
    try {
      profileImageUrl = await uploadAvatar(data.user.id, profileImageFile);
    } catch {
      profileImageUrl = null;
    }
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    nickname,
    tag,
    profile_image: profileImageUrl,
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

export async function updateProfile({
  userId,
  nickname,
  bio,
  profileImage,
}: {
  userId: string;
  nickname: string;
  bio: string;
  profileImage: string | null;
}) {
  const { error } = await supabase
    .from("profiles")
    .update({ nickname, bio, profile_image: profileImage })
    .eq("id", userId);

  if (error) throw error;
}

export async function updatePassword({
  email,
  currentPassword,
  newPassword,
}: {
  email: string;
  currentPassword: string;
  newPassword: string;
}) {
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new Error("현재 비밀번호가 일치하지 않습니다.");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

export async function deleteAccount() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("로그인 정보가 없습니다.");
  }

  const response = await fetch("/api/delete-account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "계정 삭제에 실패했습니다.");
  }

  await supabase.auth.signOut();
}

export async function signOut() {
  await supabase.auth.signOut();
}
