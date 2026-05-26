const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address";
  return null;
}

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (!digits) return "Mobile number is required";
  if (!PHONE_RE.test(digits)) return "Enter a valid 10-digit Indian mobile number";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
