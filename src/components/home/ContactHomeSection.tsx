"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ContactList } from "@/components/contact/ContactList";
import { stadiumInfo, primaryPhone } from "@/lib/data";
import { validateEmail, validatePhone, validateRequired } from "@/lib/validation";
import { useToast } from "@/components/ui/Toast";
import { Mail, MapPin, MessageCircle, Clock, CheckCircle, Loader2 } from "lucide-react";

export function ContactHomeSection() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const whatsapp = `https://wa.me/${primaryPhone.tel.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I want to enquire about Crossline Cricket Stadium.")}`;
  const mapEmbed =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3450!2d77.7!3d29.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDI4JzEyLjAiTiA3N8KwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eMap: Record<string, string> = {};
    if (validateRequired(form.name, "Name")) eMap.name = validateRequired(form.name, "Name")!;
    if (validateEmail(form.email)) eMap.email = validateEmail(form.email)!;
    if (validateRequired(form.subject, "Subject")) eMap.subject = validateRequired(form.subject, "Subject")!;
    if (validateRequired(form.message, "Message")) eMap.message = validateRequired(form.message, "Message")!;
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSent(true);
      toast("Message sent!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading badge="Contact" title="Visit & Reach Us" description="Bookings, academy, tournaments — our team is here to help." />
        </ScrollReveal>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <MapPin className="h-5 w-5 text-[var(--cricket-green)] mb-2" />
              <p className="text-sm font-bold text-[var(--navy)]">Address</p>
              <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">{stadiumInfo.address}</p>
            </Card>
            <Card>
              <p className="text-sm font-bold text-[var(--navy)] mb-3">Phone</p>
              <ContactList compact />
            </Card>
            <Card>
              <Mail className="h-5 w-5 text-[var(--brand-red)] mb-2" />
              <a href={`mailto:${stadiumInfo.email}`} className="text-sm font-medium text-[var(--navy)] hover:text-[var(--brand-red)]">
                {stadiumInfo.email}
              </a>
            </Card>
            <Card>
              <Clock className="h-5 w-5 text-[var(--navy)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">{stadiumInfo.hours}</p>
            </Card>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <Button className="w-full !bg-[#25D366] hover:!bg-[#20bd5a]">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Us
              </Button>
            </a>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <Card className="!p-0 overflow-hidden">
              <iframe title="Crossline location" src={mapEmbed} className="w-full h-56 border-0" loading="lazy" />
            </Card>
            <Card>
              {sent ? (
                <div className="text-center py-10">
                  <CheckCircle className="h-12 w-12 mx-auto text-[var(--cricket-green)]" />
                  <p className="mt-4 font-bold text-[var(--navy)]">Thank you!</p>
                  <p className="text-sm text-[var(--text-muted)]">We will contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-[var(--navy)] text-lg">Send a Message</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hname">Name *</Label>
                      <Input id="hname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="hemail">Email *</Label>
                      <Input id="hemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hphone">Phone</Label>
                    <Input id="hphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="hsubject">Subject *</Label>
                    <Input id="hsubject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <Label htmlFor="hmessage">Message *</Label>
                    <Textarea id="hmessage" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send Message
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
