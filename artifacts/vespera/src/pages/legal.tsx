import React, { useEffect } from "react";
import { motion } from "framer-motion";

const sections = [
  {
    id: "terms",
    title: "Terms & Conditions",
    content: [
      {
        heading: "1. General",
        text: "These Terms & Conditions govern your use of the Vespera website and the purchase of products through it. By accessing this website or placing an order, you agree to be bound by these terms. Vespera reserves the right to update these terms at any time without prior notice."
      },
      {
        heading: "2. Products & Pricing",
        text: "All product descriptions, images, and specifications on this website are as accurate as possible. However, slight variations may occur due to the handcrafted nature of our pieces. Prices are listed in USD and are inclusive of applicable taxes unless stated otherwise. Vespera reserves the right to modify prices at any time without prior notice. Price changes will not affect orders that have already been confirmed."
      },
      {
        heading: "3. Orders & Payment",
        text: "An order is confirmed only after successful payment processing. We reserve the right to cancel or refuse any order at our discretion, including orders that appear fraudulent or unauthorised. In the event of cancellation, a full refund will be issued to the original payment method. All payments are securely processed through Stripe. We do not store your credit or debit card information on our servers."
      },
      {
        heading: "4. Shipping & Delivery",
        text: "We ship to addresses within India and internationally. Delivery timelines are estimates and may vary due to factors beyond our control. Vespera is not liable for delays caused by customs clearance, courier services, or force majeure events. Risk of loss transfers to the buyer upon handover to the courier. For international orders, the buyer is responsible for any customs duties, import taxes, or other charges levied by the destination country."
      },
      {
        heading: "5. Returns & Refunds",
        text: "Returns are accepted within 14 days of delivery for unused, undamaged items in their original packaging. To initiate a return, contact our client care team at care@vespera.in with your order number. Refunds are processed to the original payment method within 7–10 business days of receiving the returned item. Shipping costs for returns within India are borne by Vespera. International return shipping is the responsibility of the buyer. Items that show signs of use, damage, or alteration are not eligible for return."
      },
      {
        heading: "6. Intellectual Property",
        text: "All content on this website — including but not limited to text, images, logos, product designs, and source code — is the property of Vespera and is protected under applicable intellectual property laws. Reproduction, distribution, or use of any content without prior written consent is strictly prohibited."
      },
      {
        heading: "7. Limitation of Liability",
        text: "Vespera shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of this website or the purchase of any product. Our total liability for any claim shall not exceed the purchase price of the product in question."
      },
      {
        heading: "8. Governing Law",
        text: "These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or related transactions shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra."
      }
    ]
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    content: [
      {
        heading: "1. Information We Collect",
        text: "We collect information that you provide directly to us when placing an order or contacting client care. This includes your name, email address, phone number, shipping address, and payment information. We also automatically collect certain technical data such as your IP address, browser type, and pages visited to improve our website experience."
      },
      {
        heading: "2. How We Use Your Information",
        text: "Your personal information is used to process and fulfil orders, communicate order updates and shipping notifications, respond to your enquiries and provide customer support, improve our website and services, and send promotional communications (only with your explicit consent). We do not sell, rent, or share your personal information with third parties for their marketing purposes."
      },
      {
        heading: "3. Data Sharing",
        text: "We share your data only with trusted service providers essential to our operations: Stripe for payment processing, courier partners for order delivery, and hosting providers for website infrastructure. All third-party providers are contractually obligated to protect your data and use it solely for the services they provide to us."
      },
      {
        heading: "4. Data Security",
        text: "We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL/TLS technology and processed through PCI DSS Level 1 compliant systems. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
      },
      {
        heading: "5. Cookies",
        text: "Our website uses essential cookies to ensure proper functionality, including session management and cart persistence. We do not use third-party advertising or tracking cookies. By using our website, you consent to the use of essential cookies."
      },
      {
        heading: "6. Your Rights",
        text: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at care@vespera.in. We will respond to your request within 30 days. You may also opt out of promotional communications at any time by clicking the unsubscribe link in any marketing email."
      },
      {
        heading: "7. Data Retention",
        text: "We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are retained for a minimum of 8 years as required by Indian tax and commercial law."
      },
      {
        heading: "8. Changes to This Policy",
        text: "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically."
      }
    ]
  },
  {
    id: "shipping",
    title: "Shipping Policy",
    content: [
      {
        heading: "Domestic Shipping (India)",
        text: "All orders within India are shipped via insured express courier. Standard delivery takes 5–7 business days after dispatch. Orders are dispatched within 2–3 business days of order confirmation. Complimentary shipping is offered on all domestic orders."
      },
      {
        heading: "International Shipping",
        text: "We ship internationally via express courier services. Delivery typically takes 7–14 business days depending on the destination. International shipping costs are calculated at checkout based on the delivery address. Customs duties, import taxes, and other charges levied by the destination country are the responsibility of the buyer."
      },
      {
        heading: "Order Tracking",
        text: "A tracking number is sent via email once your order has been dispatched. You can use this number to track your shipment in real time through the courier's website. If you have not received tracking information within 3 business days of placing your order, please contact our client care team."
      }
    ]
  }
];

export default function Legal() {
  useEffect(() => {
    document.title = "Legal | Vespera";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Vespera legal information — terms and conditions, privacy policy, and shipping policy.");
    }
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col">
      <section className="container mx-auto px-6 md:px-12 py-16 md:py-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary mb-4 block">Policies</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Legal</h1>
          <p className="text-muted-foreground font-sans text-sm max-w-lg mx-auto leading-relaxed">
            Please review our policies below. By using this website and purchasing our products, you agree to be bound by these terms.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="px-5 py-2 border border-border/30 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              {section.title}
            </button>
          ))}
        </motion.div>

        <div className="space-y-24">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
              className="scroll-mt-32"
            >
              <h2 className="text-3xl font-serif mb-10 pb-4 border-b border-border/20">{section.title}</h2>
              <div className="space-y-8">
                {section.content.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-sans text-sm font-semibold uppercase tracking-wide mb-3 text-foreground/90">{item.heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 pt-12 border-t border-border/20 text-center"
        >
          <p className="text-xs text-muted-foreground tracking-wide mb-2">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-xs text-muted-foreground/60">
            For questions about these policies, contact us at{" "}
            <a href="mailto:care@vespera.in" className="text-primary hover:underline underline-offset-4">care@vespera.in</a>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
