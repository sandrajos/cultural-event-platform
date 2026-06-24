import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

type Role = 'visitor' | 'organizer';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', full_name: '' });
  const [role, setRole] = useState<Role>('visitor');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error('Please accept the terms'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) { toast.error('Username: letters, digits, and _ only'); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: {
          username: form.username.trim(),
          password: form.password,
          full_name: form.full_name.trim() || undefined,
          role,
        },
      });
      if (error) {
        const msg = await error?.context?.text?.();
        toast.error(msg || 'Registration failed');
        return;
      }
      if (data?.error) { toast.error(data.error); return; }

      // Sign in after registration
      const email = `${form.username.trim()}@miaoda.com`;
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: form.password });
      if (signInError) {
        toast.success('Account created! Please sign in.');
        navigate('/auth/login');
        return;
      }
      toast.success('Welcome to Cultural Events!');
      navigate('/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent flex items-center justify-center">
              <span className="text-white font-black text-xs">CE</span>
            </div>
            <span className="font-black tracking-widest uppercase text-sm">Cultural Events</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Create Account</h2>
          <p className="text-muted-foreground">Join the platform as an organizer or visitor</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['visitor', 'organizer'] as Role[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`p-4 border text-left transition-colors ${
                role === r
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold capitalize">{r}</span>
                {role === r && <CheckCircle size={14} className="text-accent" />}
              </div>
              <p className="text-xs opacity-70">
                {r === 'visitor' ? 'Browse events & buy tickets' : 'Create & manage events'}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">Username *</Label>
            <Input id="username" value={form.username} onChange={set('username')}
              placeholder="my_username" required className="h-11"
            />
            <p className="text-xs text-muted-foreground">Letters, digits, and _ only</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
            <Input id="full_name" value={form.full_name} onChange={set('full_name')}
              placeholder="John Doe" className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
            <div className="relative">
              <Input id="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={set('password')}
                placeholder="••••••••" required className="h-11 pr-10"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
            <Input id="confirmPassword" type="password"
              value={form.confirmPassword} onChange={set('confirmPassword')}
              placeholder="••••••••" required className="h-11"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer mt-2">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-1 accent-accent" />
            <span className="text-sm text-muted-foreground">
              I agree to the{' '}
              <span className="text-foreground underline">Terms of Service</span> and{' '}
              <span className="text-foreground underline">Privacy Policy</span>
            </span>
          </label>

          <Button type="submit" disabled={loading || !agreed}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-semibold mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
