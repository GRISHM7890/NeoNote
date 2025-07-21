
'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Loader2, Send, Users, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Participant = {
  name: string;
  avatar: string;
  isUser: boolean;
  isTutor?: boolean;
};

type Message = {
  id: number;
  author: Participant;
  content: string;
  timestamp: string;
};

type ChatState = 'setup' | 'chatting';

const aiPeers: Participant[] = [
    { name: 'Rohan', avatar: '/avatars/rohan.png', isUser: false },
    { name: 'Priya', avatar: '/avatars/priya.png', isUser: false },
    { name: 'Vikram', avatar: '/avatars/vikram.png', isUser: false },
    { name: 'AI Tutor', avatar: '/avatars/tutor.png', isUser: false, isTutor: true },
];

const getInitialMessages = (topic: string, subject: string, user: Participant): Message[] => [
    {
        id: 1,
        author: aiPeers.find(p => p.name === 'AI Tutor')!,
        content: `Welcome to the chatroom for **${topic}** (${subject})! I'm your AI Tutor. Feel free to ask questions and discuss. Please keep the conversation respectful and on-topic. Let's get started!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
        id: 2,
        author: aiPeers.find(p => p.name === 'Priya')!,
        content: `Hey everyone! I'm ready. I was just reviewing my notes on ${topic}.`,
        timestamp: new Date(Date.now() + 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
];

const getSimulatedResponse = (userMessage: string, topic: string): Message[] => {
    const responses: Message[] = [];
    const now = new Date();
    
    // Rohan's response
    responses.push({
        id: Date.now(),
        author: aiPeers.find(p => p.name === 'Rohan')!,
        content: `That's a good point! I was wondering, how does that relate to the main concept of ${topic}?`,
        timestamp: new Date(now.getTime() + 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Vikram's response after a delay
    if (userMessage.includes('?')) {
        responses.push({
            id: Date.now() + 1,
            author: aiPeers.find(p => p.name === 'Vikram')!,
            content: "I think the answer might be in the textbook, section 3.2. Let me double-check.",
            timestamp: new Date(now.getTime() + 4000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
    }

    // AI Tutor's summary/clarification
    responses.push({
        id: Date.now() + 2,
        author: aiPeers.find(p => p.name === 'AI Tutor')!,
        content: `Excellent discussion. To summarize, we've covered the key idea that **${userMessage.split(" ").slice(0,5).join(" ")}...** is critical to understanding ${topic}. Keep up the great work!`,
        timestamp: new Date(now.getTime() + 6000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    
    return responses;
};


export default function PeerChatroomPage() {
  const { toast } = useToast();
  const [chatState, setChatState] = useState<ChatState>('setup');
  
  // Setup state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  // Chat state
  const [user, setUser] = useState<Participant>({ name: 'You', avatar: '', isUser: true });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('synapse-user-name') || 'Student';
    const savedImage = localStorage.getItem('synapse-profile-image') || '';
    setUser({ name: savedName, avatar: savedImage, isUser: true });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = () => {
    if (!subject || !topic) {
      toast({ title: "Missing Details", description: "Please provide both a subject and a topic.", variant: "destructive" });
      return;
    }
    const allParticipants = [user, ...aiPeers];
    setParticipants(allParticipants);
    setMessages(getInitialMessages(topic, subject, user));
    setChatState('chatting');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSimulating) return;

    const newMessage: Message = {
        id: Date.now(),
        author: user,
        content: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsSimulating(true);

    // Simulate responses
    setTimeout(() => {
        const aiResponses = getSimulatedResponse(input, topic);
        setMessages(prev => [...prev, ...aiResponses]);
        setIsSimulating(false);
    }, 1500);
  };
  
  const MessageBubble = ({ msg }: { msg: Message }) => {
    const isUser = msg.author.isUser;
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
                    <AvatarFallback>{msg.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-md rounded-lg px-4 py-2",
                isUser ? "bg-primary text-primary-foreground" : "bg-background",
                msg.author.isTutor && "bg-accent/20 border border-accent/50"
            )}>
                {!isUser && <p className="text-xs font-bold text-accent">{msg.author.name}</p>}
                <p className="text-sm prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.content }} />
                <p className="text-xs opacity-60 text-right mt-1">{msg.timestamp}</p>
            </div>
             {isUser && (
                <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.author.avatar} alt={msg.author.name} />
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
                    <p className="text-muted-foreground mt-1">Join a topic-based chatroom to discuss with AI peers.</p>
                </div>
            </header>
            <Card className="bg-secondary/30 max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>Create a Chatroom</CardTitle>
                    <CardDescription>Define the subject and topic to get started.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (e.g., Physics)" />
                    <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g., Laws of Motion)" />
                    <Button onClick={handleStartChat} className="w-full shadow-glow">Join Chat</Button>
                </CardContent>
            </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-1rem)]">
        {/* Participants Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-secondary/30 p-4 border-r">
            <h2 className="font-headline text-xl flex items-center gap-2 mb-4"><Users /> Participants</h2>
            <ul className="space-y-3">
                {participants.map(p => (
                    <li key={p.name} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={p.avatar} alt={p.name}/>
                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className={cn("font-medium", p.isUser && "text-primary")}>{p.name}</span>
                        {p.isTutor && <Badge variant="outline" className="text-accent border-accent">Tutor</Badge>}
                    </li>
                ))}
            </ul>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
            <header className="p-4 border-b flex justify-between items-center bg-background/80 backdrop-blur-sm">
                <div>
                    <h1 className="font-headline text-xl">{topic}</h1>
                    <p className="text-sm text-muted-foreground">{subject}</p>
                </div>
                <Button variant="outline" onClick={() => setChatState('setup')}>Leave Chat</Button>
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
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your message..." 
                        className="pr-20"
                        disabled={isSimulating}
                    />
                    <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" disabled={!input.trim() || isSimulating}>
                        {isSimulating ? <Loader2 className="animate-spin"/> : <Send/>}
                    </Button>
                </form>
            </footer>
        </main>
      </div>
    </AppLayout>
  );
}
