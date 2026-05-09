import React, { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCollectionPiece, useListCollection } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import { PincodeChecker } from "@/components/pincode-checker";
import { EmiMessage } from "@/components/emi-message";
import { NotifyMeButton } from "@/components/notify-me-button";
import { ReviewsSection } from "@/components/reviews-section";
import { JsonLd } from "@/components/json-ld";

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  
  const { data: pieces, isLoading: isListLoading } = useListCollection();
  const pieceId = pieces?.find(p => p.slug === slug)?.id;
  
  const { data: piece, isLoading: isPieceLoading } = useGetCollectionPiece(
    pieceId as number,
    { query: { enabled: !!pieceId } }
  );

  const isLoading = isListLoading || (!!pieceId && isPieceLoading) || (!piece && !isListLoading);

  useEffect(() => {
    if (piece) {
      document.title = `${piece.title} | Vespera`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", piece.description);
      }
    }
  }, [piece]);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsAdded(false);
  }, [slug]);

  const handleAddToBag = () => {
    if (!piece) return;
    addItem(piece);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (!isLoading && !piece) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-serif mb-6">Piece Not Found</h1>
        <p className="text-muted-foreground mb-8">This piece is no longer available in our collection.</p>
        <Link href="/collection" className="text-primary uppercase tracking-widest text-sm hover:underline underline-offset-4">
          Back to Collection
        </Link>
      </div>
    );
  }

  const allImages = piece ? [piece.primaryImage, ...(piece.images || [])] : [];

  return (
    <div className="luxury-noise pb-20 md:pb-0">
      <div className="container mx-auto px-4 md:px-8 py-4 md:py-8 relative z-10">
        <Link href="/collection" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors mb-6 group">
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Collection
        </Link>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="flex gap-4">
              <div className="hidden md:flex flex-col gap-4 w-24">
                <Skeleton className="w-24 h-32 bg-secondary/40 rounded-none" />
                <Skeleton className="w-24 h-32 bg-secondary/40 rounded-none" />
                <Skeleton className="w-24 h-32 bg-secondary/40 rounded-none" />
              </div>
              <Skeleton className="flex-1 aspect-[3/4] bg-secondary/40 rounded-none" />
            </div>
            <div className="flex flex-col pt-8">
              <Skeleton className="h-10 w-2/3 bg-secondary/40 rounded-none mb-4" />
              <Skeleton className="h-6 w-1/4 bg-secondary/40 rounded-none mb-12" />
              <Skeleton className="h-24 w-full bg-secondary/40 rounded-none mb-8" />
              <Skeleton className="h-14 w-full bg-secondary/40 rounded-none" />
            </div>
          </div>
        ) : piece ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            <div className="flex flex-col-reverse md:flex-row gap-6">
              <div className="flex md:flex-col gap-3 w-full md:w-24 shrink-0 snap-x">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-20 md:w-24 aspect-[3/4] shrink-0 snap-start transition-all duration-300 ${
                      activeImageIndex === i ? "border-primary opacity-100 shadow-[0_0_10px_rgba(212,175,55,0.15)]" : "border-border/30 opacity-40 hover:opacity-70"
                    } border`}
                  >
                    <img 
                      src={img} 
                      alt={`${piece.title} view ${i + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              <div className="flex-1 relative aspect-[3/4] md:aspect-auto bg-secondary overflow-hidden border border-border/20">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={allImages[activeImageIndex]}
                    alt={piece.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col pt-4 md:pt-12 pb-12 lg:pb-0 h-full max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">{piece.title}</h1>
                <p className="text-xl font-sans tracking-wide text-primary mb-4">{formatPrice(piece.price)}</p>
                <div className="gold-divider w-12 mb-10" />
                
                <div className="prose prose-invert prose-p:text-muted-foreground prose-p:font-sans prose-p:text-sm prose-p:leading-relaxed mb-12">
                  <p>{piece.description}</p>
                </div>

                <div className="space-y-0 border-y border-border/20 mb-12">
                  <div className="grid grid-cols-3 gap-4 py-5 border-b border-border/10">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">Material</span>
                    <span className="col-span-2 text-sm">{piece.material}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-5">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">Dimensions</span>
                    <span className="col-span-2 text-sm text-muted-foreground">{piece.dimensions}</span>
                  </div>
                </div>

                <EmiMessage price={piece.price} />
                <div className="my-6"><PincodeChecker /></div>

                {piece.stockCount > 0 ? (
                  <Button 
                    onClick={handleAddToBag}
                    disabled={isAdded}
                    className="w-full h-16 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-sm uppercase tracking-[0.2em] font-medium transition-all mb-4 relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {isAdded ? (
                        <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Added to Bag</span>
                      ) : (
                        "Add to Bag"
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-[hsl(46,65%,58%)] to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Button>
                ) : (
                  <NotifyMeButton productId={piece.id} />
                )}
                
                <p className="text-center text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase mt-4 mb-16">
                  Complimentary global shipping
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-auto space-y-12"
              >
                {piece.artisanNotes && (
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 gold-divider-vertical" />
                    <div className="pl-6">
                      <h3 className="font-serif text-xl mb-4 flex items-center gap-3">
                        Craftsmanship Notes
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {piece.artisanNotes}
                      </p>
                    </div>
                  </div>
                )}

                {piece.occasionStyling && piece.occasionStyling.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 gold-divider-vertical" />
                    <div className="pl-6">
                      <h3 className="font-serif text-xl mb-4">
                        Styling Suggestions
                      </h3>
                      <ul className="space-y-3">
                        {piece.occasionStyling.map((style, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                            <span>{style}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        ) : null}

        {piece && (
          <>
            <ReviewsSection productId={piece.id} />
            <JsonLd data={{
              "@context": "https://schema.org", "@type": "Product",
              name: piece.title, description: piece.description, image: piece.primaryImage,
              brand: { "@type": "Brand", name: "Vespera" },
              offers: { "@type": "Offer", priceCurrency: "INR", price: String(piece.price), availability: piece.stockCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `https://www.thevespera.online/collection/${piece.slug}` },
            }} />
          </>
        )}
      </div>

      {piece && piece.stockCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden">
          <div className="gold-divider w-full" />
          <div className="bg-background/95 backdrop-blur-lg px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm truncate">{piece.title}</p>
                <p className="text-primary text-sm">{formatPrice(piece.price)}</p>
              </div>
              <Button
                onClick={handleAddToBag}
                disabled={isAdded}
                className="h-12 px-8 rounded-none bg-primary text-primary-foreground text-xs uppercase tracking-[0.15em] font-medium shrink-0"
              >
                {isAdded ? (
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Added</span>
                ) : (
                  "Add to Bag"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
