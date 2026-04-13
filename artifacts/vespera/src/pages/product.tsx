import React, { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCollectionPiece, useListCollection } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";

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
    <div className="container mx-auto px-6 md:px-12 py-8 md:py-16">
      <Link href="/collection" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft className="w-3 h-3" /> Back to Collection
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
          
          {/* Gallery Section */}
          <div className="flex flex-col-reverse md:flex-row gap-6">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto scrollbar-none w-full md:w-24 shrink-0 snap-x">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative w-20 md:w-24 aspect-[3/4] shrink-0 snap-start transition-all duration-300 ${
                    activeImageIndex === i ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  } border-[1px]`}
                >
                  <img 
                    src={img} 
                    alt={`${piece.title} view ${i + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 relative aspect-[3/4] md:aspect-auto bg-secondary overflow-hidden">
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

          {/* Details Section */}
          <div className="flex flex-col pt-4 md:pt-12 pb-12 lg:pb-0 h-full max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">{piece.title}</h1>
              <p className="text-xl font-sans tracking-wide text-primary mb-12">{formatPrice(piece.price)}</p>
              
              <div className="prose prose-invert prose-p:text-muted-foreground prose-p:font-sans prose-p:text-sm prose-p:leading-relaxed mb-12">
                <p>{piece.description}</p>
              </div>

              <div className="space-y-6 border-y border-border/20 py-8 mb-12">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Material</span>
                  <span className="col-span-2 text-sm">{piece.material}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Dimensions</span>
                  <span className="col-span-2 text-sm text-muted-foreground">{piece.dimensions}</span>
                </div>
              </div>

              {piece.stockCount > 0 ? (
                <Button 
                  onClick={handleAddToBag}
                  disabled={isAdded}
                  className="w-full h-16 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-sm uppercase tracking-widest font-medium transition-all mb-4"
                >
                  {isAdded ? (
                    <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Added to Bag</span>
                  ) : (
                    "Add to Bag"
                  )}
                </Button>
              ) : (
                <Button 
                  disabled
                  variant="outline"
                  className="w-full h-16 rounded-none border-border text-muted-foreground text-sm uppercase tracking-widest transition-all mb-4"
                >
                  Currently Unavailable
                </Button>
              )}
              
              <p className="text-center text-xs text-muted-foreground tracking-widest uppercase mt-4 mb-16">
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
                <div>
                  <h3 className="font-serif text-xl mb-4 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-primary"></span>
                    Craftsmanship Notes
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                    {piece.artisanNotes}
                  </p>
                </div>
              )}

              {piece.occasionStyling && piece.occasionStyling.length > 0 && (
                <div>
                  <h3 className="font-serif text-xl mb-4 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-border"></span>
                    Styling Suggestions
                  </h3>
                  <ul className="space-y-3 pl-11">
                    {piece.occasionStyling.map((style, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{style}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
