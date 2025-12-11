import { AuditLog } from "@/models";

type AuditPayload = {
  action: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  details?: Record<string, any>;
};

// Utilitaire léger pour écrire un log d'audit.
// Suppose que connectDB a déjà été appelé dans la route appelante.
export async function logAudit(payload: AuditPayload) {
  try {
    await AuditLog.create({
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      userId: payload.userId,
      details: payload.details,
    });
  } catch (err) {
    // Ne pas bloquer la route en cas d'erreur d'audit.
    console.error("Audit log failed:", err);
  }
}

