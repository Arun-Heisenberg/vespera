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
    answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express, RuPay), UPI, net banking, and international cards via our secure payment gateway powered by Stripe."
  },
  {
    question: "Is my payment information secure?",
    answer: "Absolutely. All transactions are processed through Stripe, a PCI DSS Level 1 certified payment processor. We never store your card details on our servers."
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
      <section className="container mx-auto px-6 md:px-12 py-16 md:py-24 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-widest text-primary mb-4 block">Support</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Client Care</h1>
          <p className="text-muted-foreground font-sans text-sm max-w-lg mx-auto leading-relaxed">
            We are here to assist you with any questions about your order, our products, or anything else. Reach out and we will respond promptly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          <div className="border border-border/20 p-8 text-center group hover:border-primary/30 transition-colors">
            <Mail className="w-5 h-5 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-lg mb-2">Email</h3>
            <a href="mailto:care@vespera.in" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              care@vespera.in
            </a>
          </div>
          <div className="border border-border/20 p-8 text-center group hover:border-primary/30 transition-colors">
            <Phone className="w-5 h-5 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-lg mb-2">Phone</h3>
            <a href="tel:+911234567890" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              +91 12345 67890
            </a>
          </div>
          <div className="border border-border/20 p-8 text-center group hover:border-primary/30 transition-colors">
            <Clock className="w-5 h-5 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-lg mb-2">Hours</h3>
            <p className="text-sm text-muted-foreground">Mon – Sat, 10 AM – 7 PM IST</p>
          </div>
          <div className="border border-border/20 p-8 text-center group hover:border-primary/30 transition-colors">
            <MapPin className="w-5 h-5 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-lg mb-2">Studio</h3>
            <p className="text-sm text-muted-foreground">Mumbai, Maharashtra, India</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-serif text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground text-center mb-12 max-w-md mx-auto">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>

          <div className="max-w-3xl mx-auto divide-y divide-border/20">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-sans text-sm pr-8 group-hover:text-primary transition-colors">{faq.question}</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed pb-6 pl-0 pr-8">
                    {faq.answer}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-serif text-center mb-12">Product Care</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="border border-border/20 p-8">
              <h3 className="font-serif text-lg mb-4">Storage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Store your minaudière in the dust bag provided, away from direct sunlight and moisture. Avoid stacking pieces to prevent surface scratches.
              </p>
            </div>
            <div className="border border-border/20 p-8">
              <h3 className="font-serif text-lg mb-4">Cleaning</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gently wipe with a soft, dry microfibre cloth. For metal surfaces, use a jewellery polishing cloth. Do not use chemical cleaners or submerge in water.
              </p>
            </div>
            <div className="border border-border/20 p-8">
              <h3 className="font-serif text-lg mb-4">Handling</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open and close clasps with care. Avoid placing heavy objects on your piece. Keep away from perfume, hairspray, and abrasive surfaces.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="text-center max-w-2xl mx-auto border border-border/20 p-12 md:p-20"
        >
          <h3 className="text-2xl font-serif mb-6">Still Have Questions?</h3>
          <p className="text-muted-foreground mb-8 font-sans text-sm">
            Our client care team is ready to assist you. Write to us and we will get back to you within 24 hours.
          </p>
          <a
            href="mailto:care@vespera.in"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground uppercase tracking-widest text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Email Us
          </a>
        </motion.div>
      </section>
    </div>
  );
}
