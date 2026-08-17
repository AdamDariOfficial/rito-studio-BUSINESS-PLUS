import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { adminLoginSchema } from "./admin-auth.schemas";
import {
  consultationAdminDeleteSchema,
  consultationAdminEditSchema,
  consultationAdminGetSchema,
  consultationAdminUpdateSchema,
  consultationRequestListSchema,
  consultationRequestSchema,
} from "./schemas";
import {
  deleteConsultationLive,
  editConsultationLive,
  getConsultationLive,
  listConsultationsLive,
  updateConsultationLive,
} from "./live/live-consultation.service.server";
import {
  AdminLoginRateLimitedError,
  AdminLoginRejectedError,
  getAdminSessionDetails,
  loginAdmin,
  logoutAdmin,
  serializeAdminSessionCookie,
  serializeClearedAdminSessionCookie,
} from "./live/native-admin-auth.server";

function setSensitiveNoStore() {
  setResponseHeader("Cache-Control", "private, no-store");
}

const adminLogoutSchema = z.object({
  csrfToken: z.string().trim().min(20).max(256),
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  setSensitiveNoStore();
  const session = await getAdminSessionDetails(getRequest());
  return session
    ? {
        authenticated: true as const,
        email: session.identity.email,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt,
      }
    : { authenticated: false as const };
});

export const loginAdminSession = createServerFn({ method: "POST" })
  .validator(adminLoginSchema)
  .handler(async ({ data }) => {
    setSensitiveNoStore();
    try {
      const session = await loginAdmin(getRequest(), data.email, data.password);
      setResponseHeader("Set-Cookie", serializeAdminSessionCookie(session.token));
      return {
        ok: true as const,
        email: session.identity.email,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      if (error instanceof AdminLoginRejectedError) {
        return { ok: false as const, reason: "invalid" as const, message: error.message };
      }
      if (error instanceof AdminLoginRateLimitedError) {
        return { ok: false as const, reason: "rate-limited" as const, message: error.message };
      }
      console.error(
        "[RITO AdminAuth] Unexpected login failure",
        error instanceof Error ? { name: error.name, message: error.message } : { name: "Unknown" },
      );
      throw error;
    }
  });

export const logoutAdminSession = createServerFn({ method: "POST" })
  .validator(adminLogoutSchema)
  .handler(async ({ data }) => {
    setSensitiveNoStore();
    try {
      await logoutAdmin(getRequest(), data.csrfToken);
    } finally {
      setResponseHeader("Set-Cookie", serializeClearedAdminSessionCookie());
    }
    return { ok: true as const };
  });

export const listLiveConsultations = createServerFn({ method: "GET" }).handler(async () => {
  setSensitiveNoStore();
  return consultationRequestListSchema.parse(await listConsultationsLive(getRequest()));
});

export const getLiveConsultation = createServerFn({ method: "GET" })
  .validator(consultationAdminGetSchema)
  .handler(async ({ data }) => {
    setSensitiveNoStore();
    return consultationRequestSchema.parse(await getConsultationLive(getRequest(), data.id));
  });

export const updateLiveConsultation = createServerFn({ method: "POST" })
  .validator(consultationAdminUpdateSchema)
  .handler(async ({ data }) => {
    setSensitiveNoStore();
    return consultationRequestSchema.parse(await updateConsultationLive(getRequest(), data));
  });

export const editLiveConsultation = createServerFn({ method: "POST" })
  .validator(consultationAdminEditSchema)
  .handler(async ({ data }) => {
    setSensitiveNoStore();
    return consultationRequestSchema.parse(await editConsultationLive(getRequest(), data));
  });

export const deleteLiveConsultation = createServerFn({ method: "POST" })
  .validator(consultationAdminDeleteSchema)
  .handler(async ({ data }) => {
    setSensitiveNoStore();
    await deleteConsultationLive(getRequest(), data);
    return { ok: true } as const;
  });
