import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, Send, Users, ArrowLeft, Loader2, Trash2, LogIn
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { full_name: string | null; email: string | null };
}

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [profilesCache, setProfilesCache] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase
        .from("chat_rooms")
        .select("id, name, description, icon")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setRooms(data);
      setIsLoading(false);
    };
    fetchRooms();
  }, []);

  // Fetch messages when room selected
  const fetchMessages = useCallback(async (roomId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, room_id, user_id, content, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .range(0, 99);

    if (data) {
      setMessages(data);
      // Fetch profiles for unique user IDs
      const userIds = [...new Set(data.map(m => m.user_id))];
      const missing = userIds.filter(id => !profilesCache[id]);
      if (missing.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", missing);
        if (profiles) {
          const newCache = { ...profilesCache };
          profiles.forEach(p => { newCache[p.user_id] = { full_name: p.full_name, email: p.email }; });
          setProfilesCache(newCache);
        }
      }
    }
  }, [profilesCache]);

  useEffect(() => {
    if (!selectedRoom) return;
    fetchMessages(selectedRoom.id);
  }, [selectedRoom]);

  // Realtime subscription
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = supabase
      .channel(`room-${selectedRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as ChatMessage;
            setMessages(prev => [...prev, newMsg]);
            // Fetch profile if not cached
            if (!profilesCache[newMsg.user_id]) {
              supabase.from("profiles").select("user_id, full_name, email")
                .eq("user_id", newMsg.user_id).maybeSingle()
                .then(({ data }) => {
                  if (data) {
                    setProfilesCache(prev => ({ ...prev, [data.user_id]: { full_name: data.full_name, email: data.email } }));
                  }
                });
            }
          } else if (payload.eventType === "DELETE") {
            setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedRoom?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedRoom || isSending) return;

    setIsSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Xabar yuborilmadi");
    }
    setNewMessage("");
    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleDelete = async (messageId: string) => {
    await supabase.from("chat_messages").delete().eq("id", messageId);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) return name.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Hamjamiyat</h1>
          <p className="text-muted-foreground">Chat xonalariga kirish uchun ro'yxatdan o'ting</p>
          <Link to="/auth">
            <Button><LogIn className="w-4 h-4 mr-2" />Kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          {selectedRoom ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => setSelectedRoom(null)} className="md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="text-lg">{selectedRoom.icon}</span>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-foreground truncate">{selectedRoom.name}</h1>
                <p className="text-xs text-muted-foreground truncate">{selectedRoom.description}</p>
              </div>
            </>
          ) : (
            <>
              <Link to="/">
                <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
              </Link>
              <Users className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-foreground">Hamjamiyat</h1>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Rooms sidebar */}
        <aside className={`w-full md:w-72 md:border-r border-border bg-card flex-shrink-0 ${selectedRoom ? "hidden md:block" : ""}`}>
          <div className="p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Chat xonalari</h2>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-1">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      selectedRoom?.id === room.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="text-xl">{room.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{room.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{room.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!selectedRoom ? "hidden md:flex" : ""}`}>
          {!selectedRoom ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chat xonasini tanlang</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3 max-w-3xl mx-auto">
                  <AnimatePresence initial={false}>
                    {messages.map(msg => {
                      const isOwn = msg.user_id === user.id;
                      const profile = profilesCache[msg.user_id];
                      const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Foydalanuvchi";

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex gap-2.5 group ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          {!isOwn && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {getInitials(profile?.full_name ?? null, profile?.email ?? null)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[75%] ${isOwn ? "items-end" : ""}`}>
                            {!isOwn && (
                              <p className="text-xs text-muted-foreground mb-0.5 px-1">{displayName}</p>
                            )}
                            <div className={`relative rounded-2xl px-3.5 py-2 text-sm ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}>
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <span className={`text-[10px] mt-1 block ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                            {isOwn && (
                              <button
                                onClick={() => handleDelete(msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 ml-auto block"
                              >
                                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-3 bg-card">
                <form
                  onSubmit={e => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2 max-w-3xl mx-auto"
                >
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Xabar yozing..."
                    className="flex-1 rounded-full"
                    maxLength={1000}
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full flex-shrink-0"
                    disabled={!newMessage.trim() || isSending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
