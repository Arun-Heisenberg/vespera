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
      <section className="relative py-12 md:py-20 overflow-hidden">
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

      <section className="w-full px-5 md:px-10 py-12 md:py-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20"
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
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <div className="text-center mb-10">
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
          className="mb-16 md:mb-20"
        >
          <div className="text-center mb-10">
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
