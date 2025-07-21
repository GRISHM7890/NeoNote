
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Loader2, Send, Users, User, Bot, KeyRound, Copy, Check, LogOut, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, onSnapshot, doc, setDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

type Participant = {
  name: string;
  avatar: string;
};

type Message = {
  id: string;
  author: Participant;
  content: string;
  timestamp: any;
};

type ChatRoom = {
    id: string;
    topic: string;
    subject: string;
    passkey: string;
    participants: Participant[];
};

type ChatState = 'setup' | 'chatting';

const getTutorMessage = (topic: string, subject: string): Omit<Message, 'id' | 'timestamp'> => ({
    author: { name: 'AI Tutor', avatar: '' },
    content: `Welcome to the chatroom for **${topic}** (${subject})! I'm your AI Tutor. Please keep the conversation respectful and on-topic. Let's get started!`
});

export default function PeerChatroomPage() {
  const { toast } = useToast();
  const [chatState, setChatState] = useState<ChatState>('setup');
  
  // User & Room State
  const [user, setUser] = useState<Participant>({ name: 'Student', avatar: '' });
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Form State
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [createPasskey, setCreatePasskey] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPasskey, setJoinPasskey] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('synapse-user-name') || 'Student';
    const savedImage = localStorage.getItem('synapse-profile-image') || '';
    setUser({ name: savedName, avatar: savedImage });
  }, []);

  useEffect(() => {
    if (currentRoom?.id) {
        const messagesRef = collection(db, `chatrooms/${currentRoom.id}/messages`);
        const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: Message[] = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(msgs);
        });

        return () => unsubscribe();
    }
  }, [currentRoom?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateRoom = async () => {
    if (!subject || !topic || !createPasskey) {
      toast({ title: "Missing Details", description: "Please provide a subject, topic, and a passkey.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
        const roomRef = await addDoc(collection(db, 'chatrooms'), {
            subject,
            topic,
            passkey: createPasskey,
            participants: [user]
        });
        
        // Add welcome message from tutor
        await addDoc(collection(db, `chatrooms/${roomRef.id}/messages`), {
            ...getTutorMessage(topic, subject),
            timestamp: serverTimestamp()
        });

        setCurrentRoom({ id: roomRef.id, subject, topic, passkey: createPasskey, participants: [user] });
        setChatState('chatting');
        toast({ title: 'Room Created!', description: 'Share the room ID with others to join.' });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not create the chatroom.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId || !joinPasskey) {
        toast({ title: "Missing Details", description: "Please provide a Room ID and Passkey.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        const q = query(collection(db, 'chatrooms'), where('__name__', '==', joinRoomId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            toast({ title: "Room not found", variant: 'destructive' });
            setIsLoading(false);
            return;
        }
        const roomDoc = querySnapshot.docs[0];
        const roomData = roomDoc.data() as Omit<ChatRoom, 'id'>;

        if(roomData.passkey !== joinPasskey) {
             toast({ title: "Incorrect Passkey", variant: 'destructive' });
             setIsLoading(false);
             return;
        }
        
        setCurrentRoom({ id: roomDoc.id, ...roomData });
        setChatState('chatting');

    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not join the chatroom.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentRoom) return;

    const content = messageInput;
    setMessageInput('');
    
    await addDoc(collection(db, `chatrooms/${currentRoom.id}/messages`), {
        author: user,
        content,
        timestamp: serverTimestamp(),
    });
  };

  const leaveChat = () => {
    setCurrentRoom(null);
    setMessages([]);
    setChatState('setup');
  }

  const handleCopyId = () => {
    if(!currentRoom?.id) return;
    navigator.clipboard.writeText(currentRoom.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const MessageBubble = ({ msg }: { msg: Message }) => {
    const isUser = msg.author.name === user.name;
    const isTutor = msg.author.name === 'AI Tutor';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("flex items-start gap-3", isUser && "justify-end")}
        >
            {!isUser && (
                <Avatar className="w-8 h-8 border-2 border-primary/50">
                    <AvatarImage src={msg.author.avatar} alt={msg.author.name} />
                    <AvatarFallback>{isTutor ? <Bot/> : msg.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-md rounded-lg px-4 py-2",
                isUser ? "bg-primary text-primary-foreground" : "bg-background",
                isTutor && "bg-accent/20 border border-accent/50"
            )}>
                {!isUser && <p className={cn("text-xs font-bold", isTutor ? "text-accent" : "text-primary/80")}>{msg.author.name}</p>}
                <p className="text-sm prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.content }} />
                {msg.timestamp && <p className="text-xs opacity-60 text-right mt-1">{msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
            </div>
             {isUser && (
                <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    )
  }

  if (chatState === 'setup') {
    return (
      <AppLayout>
        <div className="flex-1 p-4 md:p-8 space-y-8">
            <header className="flex items-center gap-4">
                <MessageCircle className="w-10 h-10 text-accent" />
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl">Academic Peer Chatroom</h1>
                    <p className="text-muted-foreground mt-1">Create or join a topic-based chatroom.</p>
                </div>
            </header>
            <Tabs defaultValue="create" className="max-w-md mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Room</TabsTrigger>
                    <TabsTrigger value="join">Join Room</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                    <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle>Create a New Chatroom</CardTitle>
                            <CardDescription>Define a subject, topic, and a passkey for your new room.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (e.g., Physics)" />
                            <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g., Laws of Motion)" />
                            <Input value={createPasskey} onChange={e => setCreatePasskey(e.target.value)} placeholder="Create a Passkey" />
                            <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full shadow-glow">
                                {isLoading ? <Loader2 className="animate-spin"/> : "Create & Join"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="join">
                    <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle>Join an Existing Room</CardTitle>
                            <CardDescription>Enter the Room ID and Passkey to join a session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input value={joinRoomId} onChange={e => setJoinRoomId(e.target.value)} placeholder="Enter Room ID" />
                            <Input value={joinPasskey} onChange={e => setJoinPasskey(e.target.value)} placeholder="Enter Passkey" />
                            <Button onClick={handleJoinRoom} disabled={isLoading} className="w-full shadow-glow">
                                {isLoading ? <Loader2 className="animate-spin"/> : "Join Room"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout inChat={true} onLeaveChat={leaveChat}>
      <div className="flex h-[calc(100vh-1rem)]">
        <main className="flex-1 flex flex-col">
            <header className="p-4 border-b flex flex-col md:flex-row gap-2 justify-between items-center bg-background/80 backdrop-blur-sm">
                <div>
                    <h1 className="font-headline text-xl">{currentRoom?.topic}</h1>
                    <p className="text-sm text-muted-foreground">{currentRoom?.subject}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex items-center text-sm bg-secondary/50 p-2 rounded-md">
                        <span className="text-muted-foreground mr-2">Room ID:</span>
                        <span className="font-mono text-accent">{currentRoom?.id}</span>
                        <Button size="icon" variant="ghost" className="w-6 h-6 ml-1" onClick={handleCopyId}>
                            {copied ? <Check className="text-green-500"/> : <Copy/>}
                        </Button>
                    </div>
                     <div className="flex items-center text-sm bg-secondary/50 p-2 rounded-md">
                         <KeyRound className="w-4 h-4 mr-2 text-muted-foreground"/>
                         <span className="font-mono">{currentRoom?.passkey}</span>
                     </div>
                    <Button variant="outline" onClick={leaveChat} className="hidden md:flex">
                        <LogOut /> Leave
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence>
                    {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                </AnimatePresence>
                <div ref={chatEndRef} />
            </div>

            <footer className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="relative">
                    <Input 
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        placeholder="Type your message..." 
                        className="pr-12"
                    />
                    <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Send/>
                    </Button>
                </form>
            </footer>
        </main>
      </div>
    </AppLayout>
  );
}
