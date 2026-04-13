import { useEffect } from "react";
import { useUser, useClerk, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Calendar } from "lucide-react";

function AccountContent() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 md:px-12 py-12 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-serif mb-2">My Account</h1>
        <p className="text-muted-foreground text-sm mb-12">Manage your Vespera profile.</p>

        <div className="space-y-8">
          <div className="flex items-center gap-6 p-6 border border-border/20 bg-secondary/10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName || ""} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-serif text-xl">{user.fullName || "Valued Client"}</h2>
              <p className="text-muted-foreground text-sm">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Account Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-3 border-b border-border/10">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm ml-auto">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-border/10">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm ml-auto">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—"}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => signOut(() => setLocation("/"))}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Account() {
  useEffect(() => {
    document.title = "My Account | Vespera";
  }, []);

  const [, setLocation] = useLocation();

  return (
    <>
      <Show when="signed-in">
        <AccountContent />
      </Show>
      <Show when="signed-out">
        <div className="container mx-auto px-6 md:px-12 py-24 text-center">
          <h1 className="text-3xl font-serif mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">Please sign in to view your account.</p>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setLocation("/sign-in")}
          >
            Sign In
          </Button>
        </div>
      </Show>
    </>
  );
}
