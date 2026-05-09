import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, MapPin, ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "How long does shipping take?",
    answer: "All orders are dispatched within 2–3 business days. Standard delivery within India takes 5–7 business days. International orders are shipped via express courier and typically arrive within 7–14 business days. You will receive a tracking number once your order has shipped."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery for unused items in their original packaging. To initiate a return, please contact our client care team with your order number. Once approved, we will arrange a pickup at no extra cost within India. Refunds are processed within 7–10 business days after we receive the returned item."
  },
  {
    question: "Do you offer exchanges?",
    answer: "Yes, exchanges are available for items in their original, unused condition within 14 days of delivery. Please reach out to our team and we will guide you through the process."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order has been dispatched, you will receive an email with a tracking link. You can use this link to monitor your shipment in real time. If you have not received a tracking email within 3 business days of placing your order, please contact us."
  },
  {
    question: "Are your products covered by a warranty?",
    answer: "Every Vespera piece comes with a 1-year warranty against manufacturing defects. This covers issues with clasps, hinges, and structural integrity under normal use. The warranty does not cover damage from misuse, accidents, or unauthorised repairs."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express, RuPay), UPI, net banking, and international cards via our secure payment gateway powered by Razorpay."
  },
  {
    question: "Is my payment information secure?",
    answer: "Absolutely. All transactions are processed through Razorpay, a PCI DSS Level 1 certified payment processor. We never store your card details on our servers."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship worldwide. International shipping costs and delivery times vary by destination. All applicable customs duties and import taxes are the responsibility of the buyer."
  }
];

export default function ClientCare() {
  useEffect(() => {
    document.title = "Client Care | Vespera";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Vespera client care — shipping, returns, exchanges, order tracking, and product care for your sculptural evening minaudière.");
    }
  }, []);

  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col">
      <section className="relative py-8 md:py-14 overflow-hidden">
        <div className="absolute inset-0 luxury-glow z-0" />
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-3 font-light">We're Here For You</span>
            <h1 className="text-3xl md:text-5xl font-serif mb-4">Client Care</h1>
            <p className="text-foreground/40 text-sm md:text-base font-light max-w-md mx-auto">
              Questions about your order, our products, or anything else? We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="gold-divider w-full" />

      <section className="w-full px-5 md:px-10 py-8 md:py-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14"
        >
          {[
            { icon: Mail, title: "Email", detail: "care@vespera.in", href: "mailto:care@vespera.in" },
            { icon: Phone, title: "Phone", detail: "+91 12345 67890", href: "tel:+911234567890" },
            { icon: Clock, title: "Hours", detail: "Mon – Sat, 10 AM – 7 PM IST" },
            { icon: MapPin, title: "Studio", detail: "Mumbai, Maharashtra, India" },
          ].map((item, i) => {
            const Wrapper = item.href ? 'a' : 'div';
            return (
              <Wrapper
                key={item.title}
                {...(item.href ? { href: item.href } : {})}
                className="group border border-border/10 p-6 md:p-8 text-center hover:border-primary/20 transition-all duration-500"
              >
                <item.icon className="w-5 h-5 text-primary/60 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-serif text-sm md:text-base mb-2">{item.title}</h3>
                <span className="text-[11px] md:text-xs text-foreground/40 group-hover:text-primary/70 transition-colors duration-300 font-light">{item.detail}</span>
              </Wrapper>
            );
          })}
        </motion.div>

        <motion.div
          id="faq"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-14 scroll-mt-20"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-3 font-light">Common Questions</span>
            <h2 className="text-2xl md:text-3xl font-serif">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border/10">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 md:py-6 text-left group"
                >
                  <span className="text-sm md:text-base pr-8 group-hover:text-primary transition-colors duration-300 font-light">{faq.question}</span>
                  <ChevronDown 
                    className={`w-4 h-4 text-foreground/30 shrink-0 transition-transform duration-400 ${openFaq === i ? "rotate-180" : ""}`} 
                    strokeWidth={1.5}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-foreground/40 leading-relaxed pb-6 pr-8 font-light">
                    {faq.answer}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-14"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-3 font-light">Preservation</span>
            <h2 className="text-2xl md:text-3xl font-serif">Product Care</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { title: "Storage", desc: "Store in the dust bag provided, away from direct sunlight and moisture. Avoid stacking pieces." },
              { title: "Cleaning", desc: "Wipe with a soft, dry microfibre cloth. For metal, use a jewellery polishing cloth. No chemical cleaners." },
              { title: "Handling", desc: "Open and close clasps with care. Keep away from perfume, hairspray, and abrasive surfaces." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-border/10 p-6 md:p-8 hover:border-primary/15 transition-all duration-500"
              >
                <h3 className="font-serif text-base md:text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-foreground/40 leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg mx-auto mb-10 md:mb-14"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-3 font-light">Stay Connected</span>
          <h2 className="text-2xl md:text-3xl font-serif mb-6">Follow Us</h2>
          <div className="flex items-center justify-center gap-8">
            <a href="https://instagram.com/thevespera" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-primary transition-colors duration-300" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://facebook.com/thevespera" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-primary transition-colors duration-300" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://twitter.com/thevespera" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-primary transition-colors duration-300" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://youtube.com/@thevespera" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-primary transition-colors duration-300" aria-label="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg mx-auto"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-auto mb-6" />
          <h3 className="text-2xl font-serif mb-3">Still Have Questions?</h3>
          <p className="text-foreground/40 mb-8 text-sm font-light">
            Our team will get back to you within 24 hours.
          </p>
          <a
            href="mailto:care@vespera.in"
            className="group inline-flex items-center gap-3 px-10 py-4 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-all duration-500 tracking-[0.25em] uppercase text-[11px] font-light"
          >
            Email Us
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
