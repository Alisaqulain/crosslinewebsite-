import { connectMongo, isMongoConfigured } from "./mongodb";
import { verifyEmailConnection, maskEmail, getEmailPassLength } from "./email";
import { readStore } from "./db";

export type CheckStatus = "ok" | "warn" | "error" | "skip";

export interface EnvCheck {
  name: string;
  status: CheckStatus;
  message: string;
  hint?: string;
}

export interface HealthReport {
  ok: boolean;
  checkedAt: string;
  storage: "mongodb" | "file";
  checks: EnvCheck[];
}

function envSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

export async function runHealthCheck(): Promise<HealthReport> {
  const checks: EnvCheck[] = [];

  // MongoDB URI
  const mongoConfigured = isMongoConfigured();
  checks.push({
    name: "MONGODB_URI",
    status: mongoConfigured ? "ok" : "warn",
    message: mongoConfigured ? "Environment variable is set" : "Not set — using local file storage (data/store.json)",
    hint: mongoConfigured ? undefined : "Add your MongoDB Atlas connection string to .env.local",
  });

  if (mongoConfigured) {
    try {
      const conn = await connectMongo();
      if (conn) {
        await conn.connection.db?.admin().ping();
        checks.push({
          name: "MongoDB Connection",
          status: "ok",
          message: "Connected and ping successful",
        });
      } else {
        checks.push({
          name: "MongoDB Connection",
          status: "error",
          message: "Could not establish connection",
          hint: "Check username, password, and IP whitelist in MongoDB Atlas",
        });
      }
    } catch (err) {
      checks.push({
        name: "MongoDB Connection",
        status: "error",
        message: err instanceof Error ? err.message : "Connection failed",
        hint: "Verify MONGODB_URI format and network access in Atlas",
      });
    }
  } else {
    try {
      await readStore();
      checks.push({
        name: "File Storage",
        status: "ok",
        message: "Local store readable (development fallback)",
      });
    } catch (err) {
      checks.push({
        name: "File Storage",
        status: "error",
        message: err instanceof Error ? err.message : "Could not read store",
      });
    }
  }

  // Email vars
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim();

  checks.push({
    name: "EMAIL_USER",
    status: emailUser ? "ok" : "warn",
    message: emailUser ? `Set (${maskEmail(emailUser)})` : "Not set",
    hint: emailUser ? undefined : "Add your Gmail address to .env.local",
  });

  checks.push({
    name: "EMAIL_PASS",
    status: emailPass ? (getEmailPassLength() === 16 ? "ok" : "warn") : "warn",
    message: emailPass
      ? getEmailPassLength() === 16
        ? "Set (hidden) — 16 characters ✓"
        : `Set but ${getEmailPassLength()} characters — Gmail App Passwords must be exactly 16`
      : "Not set",
    hint:
      emailPass && getEmailPassLength() !== 16
        ? "Regenerate at myaccount.google.com/apppasswords and paste all 16 characters (spaces optional)"
        : emailPass
          ? undefined
          : "Add Gmail App Password (not your normal password)",
  });

  checks.push({
    name: "ADMIN_EMAIL",
    status: adminEmail ? "ok" : "warn",
    message: adminEmail ? `Set (${maskEmail(adminEmail)})` : "Not set — will use EMAIL_USER as sender",
    hint: adminEmail ? undefined : "Optional: sender address shown to customers",
  });

  if (emailUser && emailPass) {
    if (adminEmail && adminEmail.toLowerCase() !== emailUser.toLowerCase()) {
      checks.push({
        name: "Email From Address",
        status: "warn",
        message: "ADMIN_EMAIL differs from EMAIL_USER — Gmail may block sending",
        hint: "Set ADMIN_EMAIL to the same Gmail as EMAIL_USER, or use a Google Workspace alias",
      });
    }
    const emailResult = await verifyEmailConnection();
    checks.push({
      name: "Email SMTP",
      status: emailResult.ok ? "ok" : "error",
      message: emailResult.message,
      hint: emailResult.ok
        ? undefined
        : "Enable 2FA on Gmail and create an App Password under Google Account → Security",
    });
  } else {
    checks.push({
      name: "Email SMTP",
      status: "skip",
      message: "Skipped — configure EMAIL_USER and EMAIL_PASS first",
      hint: "Emails will be logged to data/email-log.json until configured",
    });
  }

  // Admin token
  const adminToken = process.env.ADMIN_API_TOKEN?.trim();
  const defaultToken = adminToken === "crossline-admin-secret";
  const adminUser = process.env.ADMIN_USERNAME?.trim() || "admincrossline";

  checks.push({
    name: "ADMIN_USERNAME",
    status: "ok",
    message: `Configured (${adminUser})`,
  });

  checks.push({
    name: "ADMIN_PASSWORD",
    status: envSet("ADMIN_PASSWORD") ? "ok" : "warn",
    message: envSet("ADMIN_PASSWORD") ? "Set (hidden)" : "Using default — set ADMIN_PASSWORD in .env.local",
  });

  checks.push({
    name: "ADMIN_API_TOKEN",
    status: adminToken ? (defaultToken ? "warn" : "ok") : "warn",
    message: adminToken
      ? defaultToken
        ? "Set but using default — change for production"
        : "Set (hidden)"
      : "Not set — using default token",
    hint: defaultToken ? "Set a strong random secret in .env.local" : undefined,
  });

  const hasError = checks.some((c) => c.status === "error");
  const storage: HealthReport["storage"] = mongoConfigured ? "mongodb" : "file";

  return {
    ok: !hasError,
    checkedAt: new Date().toISOString(),
    storage,
    checks,
  };
}
