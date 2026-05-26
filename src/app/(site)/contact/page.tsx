"use client";

import { useState } from "react";
import { MediaImage } from "@/components/media/MediaImage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { stadiumInfo, primaryPhone } from "@/lib/data";
import { images } from "@/lib/media";
import { PageHero } from "@/components/media/PageHero";
import { ContactList } from "@/components/contact/ContactList";
import { validateEmail, validatePhone, validateRequired } from "@/lib/validation";
import { useToast } from "@/components/ui/Toast";
import { Mail, MapPin, Clock, CheckCircle, MessageCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const whatsapp = `https://wa.me/${primaryPhone.tel.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I want to enquire about booking at Crossline Cricket Stadium.")}`;
  const mapEmbed =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3450.0!2d77.7!3d29.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDI4JzEyLjAiTiA3N8KwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eMap: Record<string, string> = {};
    const n = validateRequired(form.name, "Name");
    const em = validateEmail(form.email);
    const sub = validateRequired(form.subject, "Subject");
    const msg = validateRequired(form.message, "Message");
    if (form.phone) {
      const ph = validatePhone(form.phone);
      if (ph) eMap.phone = ph;
    }
    if (n) eMap.name = n;
    if (em) eMap.email = em;
    if (sub) eMap.subject = sub;
    if (msg) eMap.message = msg;
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
      toast("Message sent successfully!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        badge="Contact"
        title="Get In Touch"
        description="Questions about bookings, events, or facilities? Reach our team in Muzaffarnagar."
        image={images.contact.hero}
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Card className="flex gap-4">
                <MapPin className="h-5 w-5 shrink-0 text-[#39B54A]" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Address</p>
                  <p className="text-sm text-white mt-1 leading-relaxed">{stadiumInfo.address}</p>
                </div>
              </Card>
              <Card>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Call Us</p>
                <ContactList compact />
              </Card>
              <Card className="flex gap-4">
                <Mail className="h-5 w-5 shrink-0 text-[#ED1C24]" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                  <a href={`mailto:${stadiumInfo.email}`} className="text-sm text-white mt-0.5 hover:text-[#FBB03B]">
                    {stadiumInfo.email}
                  </a>
                </div>
              </Card>
              <Card className="flex gap-4">
                <Clock className="h-5 w-5 shrink-0 text-[#FBB03B]" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Hours</p>
                  <p className="text-sm text-white mt-0.5">{stadiumInfo.hours}</p>
                </div>
              </Card>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] border-0">
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="p-0 overflow-hidden">
                <iframe
                  title="Crossline Cricket Stadium Location"
                  src={mapEmbed}
                  className="w-full h-64 border-0 grayscale-[30%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Card>
              <Card>
                {sent ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-[#39B54A]" />
                    <h2 className="mt-4 text-xl font-bold text-white">Message Sent!</h2>
                    <p className="mt-2 text-slate-400">We&apos;ll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-2">Send a Message</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cname">Name *</Label>
                        <Input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cemail">Email *</Label>
                        <Input id="cemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cphone">Phone</Label>
                      <Input id="cphone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
                      {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="csubject">Subject *</Label>
                      <Input id="csubject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Booking inquiry" />
                      {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cmessage">Message *</Label>
                      <Textarea id="cmessage" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
                      {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
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
    </div>
  );
}
