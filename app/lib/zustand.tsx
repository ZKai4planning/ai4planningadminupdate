// import { create } from "zustand";
// import { jwtDecode } from "jwt-decode";

// interface JwtPayload {
//   userId: string;
//   exp: number;
//   iat: number;
// }

// interface AuthState {
//   token: string | null;
//   userId: string | null;

//   setToken: (token: string) => void;
//   clearAuth: () => void;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   token: null,
//   userId: null,

//   /* =========================
//      SET TOKEN (IN-MEMORY ONLY)
//   ========================= */
//   setToken: (token: string) => {
//     try {
//       const decoded = jwtDecode<JwtPayload>(token);

//       set({
//         token,
//         userId: decoded.userId,
//       });
//     } catch (error) {
//       console.error("Invalid JWT token");
//       set({ token: null, userId: null });
//     }
//   },

//   /* =========================
//      LOGOUT / CLEAR
//   ========================= */
//   clearAuth: () => {
//     set({ token: null, userId: null });
//   },
// }));
