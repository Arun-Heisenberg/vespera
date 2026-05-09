import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918073723429";

export function WhatsappFloatingButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Vespera, I have a question about a piece.")}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with Vespera on WhatsApp"
      className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
      <MessageCircle className="w-5 h-5" />
    </a>
  );
}
