import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, MapPin, ChevronRight } from "lucide-react";

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
      <section className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-serif mb-2">Client Care</h1>
          <p className="text-muted-foreground font-sans text-xs max-w-md mx-auto">
            Questions about your order, our products, or anything else? We're here to help.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
        >
          <a href="mailto:care@vespera.in" className="border border-border/20 p-4 text-center group hover:border-primary/30 transition-colors">
            <Mail className="w-4 h-4 text-primary mx-auto mb-2" />
            <h3 className="font-serif text-sm mb-1">Email</h3>
            <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">care@vespera.in</span>
          </a>
          <a href="tel:+911234567890" className="border border-border/20 p-4 text-center group hover:border-primary/30 transition-colors">
            <Phone className="w-4 h-4 text-primary mx-auto mb-2" />
            <h3 className="font-serif text-sm mb-1">Phone</h3>
            <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">+91 12345 67890</span>
          </a>
          <div className="border border-border/20 p-4 text-center group hover:border-primary/30 transition-colors">
            <Clock className="w-4 h-4 text-primary mx-auto mb-2" />
            <h3 className="font-serif text-sm mb-1">Hours</h3>
            <p className="text-[11px] text-muted-foreground">Mon – Sat, 10 AM – 7 PM IST</p>
          </div>
          <div className="border border-border/20 p-4 text-center group hover:border-primary/30 transition-colors">
            <MapPin className="w-4 h-4 text-primary mx-auto mb-2" />
            <h3 className="font-serif text-sm mb-1">Studio</h3>
            <p className="text-[11px] text-muted-foreground">Mumbai, Maharashtra, India</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-serif text-center mb-2">Frequently Asked Questions</h2>
          <p className="text-[11px] text-muted-foreground text-center mb-5 max-w-sm mx-auto">
            Common questions about orders, shipping, returns, and more.
          </p>

          <div className="max-w-2xl mx-auto divide-y divide-border/20">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-3.5 text-left group"
                >
                  <span className="font-sans text-sm pr-6 group-hover:text-primary transition-colors">{faq.question}</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-muted-foreground leading-relaxed pb-4 pr-6">
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
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-serif text-center mb-5">Product Care</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <div className="border border-border/20 p-5">
              <h3 className="font-serif text-sm mb-2">Storage</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Store in the dust bag provided, away from direct sunlight and moisture. Avoid stacking pieces.
              </p>
            </div>
            <div className="border border-border/20 p-5">
              <h3 className="font-serif text-sm mb-2">Cleaning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Wipe with a soft, dry microfibre cloth. For metal, use a jewellery polishing cloth. No chemical cleaners.
              </p>
            </div>
            <div className="border border-border/20 p-5">
              <h3 className="font-serif text-sm mb-2">Handling</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open and close clasps with care. Keep away from perfume, hairspray, and abrasive surfaces.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg mx-auto border border-border/20 p-8"
        >
          <h3 className="text-lg font-serif mb-3">Still Have Questions?</h3>
          <p className="text-muted-foreground mb-4 font-sans text-xs">
            Our team will get back to you within 24 hours.
          </p>
          <a
            href="mailto:care@vespera.in"
            className="inline-block px-6 py-2.5 bg-primary text-primary-foreground uppercase tracking-widest text-[11px] font-semibold hover:bg-primary/90 transition-colors"
          >
            Email Us
          </a>
        </motion.div>
      </section>
    </div>
  );
}
