
'use client';

import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, Palette, Trash2, Moon, Sun, Monitor, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedImage = localStorage.getItem('synapse-profile-image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const handleClearLibrary = () => {
    localStorage.removeItem('synapse-library');
    toast({
        title: 'Library Cleared',
        description: 'All your saved items have been deleted.',
    });
    router.refresh(); 
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setProfileImage(dataUrl);
        localStorage.setItem('synapse-profile-image', dataUrl);
        toast({
          title: 'Profile Picture Updated!',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('synapse-profile-image');
    toast({
      title: 'Profile Picture Removed',
    });
  };


  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Settings className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your application preferences.</p>
          </div>
        </header>

        <div className="grid gap-8 max-w-2xl mx-auto">
            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User/> Profile</CardTitle>
                    <CardDescription>Customize your public profile information.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                        <AvatarImage src={profileImage || ''} alt="User profile picture" />
                        <AvatarFallback>
                            <User className="w-10 h-10" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden"/>
                        <Button onClick={() => fileInputRef.current?.click()}>Upload Picture</Button>
                        {profileImage && (
                          <Button variant="ghost" onClick={handleRemoveImage}>Remove</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette/> Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Label>Theme</Label>
                     <RadioGroup value={theme} onValueChange={setTheme} className="grid sm:grid-cols-3 gap-4">
                        <Label className="flex items-center gap-3 p-4 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer">
                            <Sun/>
                            <RadioGroupItem value="light" id="light" />
                            Light
                        </Label>
                        <Label className="flex items-center gap-3 p-4 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer">
                            <Moon/>
                            <RadioGroupItem value="dark" id="dark" />
                            Dark
                        </Label>
                         <Label className="flex items-center gap-3 p-4 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer">
                            <Monitor/>
                            <RadioGroupItem value="system" id="system" />
                            System
                        </Label>
                     </RadioGroup>
                </CardContent>
            </Card>

             <Card className="bg-secondary/30 border-destructive/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trash2/> Data Management</CardTitle>
                    <CardDescription>Manage your locally stored data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Clear Library</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your saved items from your browser's local storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearLibrary}>Yes, delete everything</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
