export type AuthPayload = {
  token?: string;
  email?: string;
  user?: {
    userId?: string;
    userID?: string;
    userid?: string;
    userRefId?: string;
    id?: string;
    _id?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
  userId?: string;
};

const parseAuthPayload = (value: string | null): AuthPayload | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthPayload;
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64Url.padEnd(Math.ceil(base64Url.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const readCurrentAuth = (): AuthPayload | null => {
  if (typeof window === "undefined") return null;
  return (
    parseAuthPayload(sessionStorage.getItem("currentAuth")) ||
    parseAuthPayload(localStorage.getItem("currentAuth"))
  );
};

export const resolveAuthUserId = (auth: AuthPayload | null): string => {
  if (!auth) return "";

  const directCandidates = [
    auth.user?.userId,
    auth.user?.userID,
    auth.user?.userid,
    auth.user?.userRefId,
    auth.user?.id,
    auth.user?._id,
    auth.userId,
  ];

  const directId = directCandidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  );
  if (directId) return (directId as string).trim();

  if (!auth.token) return "";
  const decoded = decodeJwtPayload(auth.token);
  const tokenCandidates = [
    decoded?.userId,
    decoded?.userID,
    decoded?.userid,
    decoded?.sub,
    decoded?.id,
  ];
  const tokenId = tokenCandidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  );
  return tokenId ? (tokenId as string).trim() : "";
};

export const resolveAuthName = (auth: AuthPayload | null): string => {
  const value = auth?.user?.name || auth?.user?.fullName || "";
  return typeof value === "string" ? value : "";
};

export const resolveAuthEmail = (auth: AuthPayload | null): string => {
  const value = auth?.email || auth?.user?.email || "";
  return typeof value === "string" ? value : "";
};
