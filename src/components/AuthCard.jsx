import React, { useState } from 'react';
import { Eye, EyeOff, Zap, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { saveUserProfile } from '../services/userDataService';
import { useFitness } from '../context/FitnessContext';

function formatFirebaseAuthError(err) {
  const code = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Switch to LOG IN instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Please allow popups and try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled yet in Firebase Console → Authentication → Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized yet in Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    default:
      return err?.message || 'Authentication failed. Please try again.';
  }
}

export default function AuthCard({
  subtitle,
  onSuccess,
  onClose,
  showCloseButton = false,
  initialMode = 'login',
}) {
  const { user, updateUserMetrics, showToast } = useFitness();

  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'signup'
  const [step, setStep] = useState('credentials'); // 'credentials' | 'profile'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Credentials state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Optional quick profile setup for brand-new accounts
  const [profileForm, setProfileForm] = useState({
    gender: user?.gender || 'male',
    age: user?.age || 24,
    height: user?.height || 175,
    weight: user?.weight || 70.0,
    targetWeight: user?.targetWeight || 68.0,
    goal: user?.goal || 'loss',
    activity: user?.activity || 1.55,
  });

  const resolvedSubtitle =
    step === 'profile'
      ? 'Set your body stats to personalize your calorie & workout goals.'
      : subtitle ||
        (authMode === 'login'
          ? 'Log in to track your workouts and meals.'
          : 'Create your free account to save your progress.');

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: '' };
    if (pass.length < 6) return { label: 'Too short', color: 'text-rose-400' };
    if (pass.length < 10) return { label: 'Good', color: 'text-amber-400' };
    return { label: 'Strong', color: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'signup') {
        const derivedName = fullName.trim() || trimmedEmail.split('@')[0];
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, { displayName: derivedName });

        // Persist user's chosen name right away into Firestore
        await saveUserProfile(cred.user.uid, {
          name: derivedName,
          email: trimmedEmail,
        }).catch(() => {});

        showToast(`Account created! Welcome, ${derivedName}!`, 'success');
        setStep('profile');
      } else {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const displayName = cred.user.displayName || trimmedEmail.split('@')[0];

        confetti({
          particleCount: 55,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#FF2A2E', '#10B981', '#06B6D4'],
        });

        showToast(`Welcome back, ${displayName}! Your saved data is synced.`, 'success');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setErrorMessage(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const googleName = cred.user.displayName || cred.user.email?.split('@')[0] || 'Athlete';

      confetti({
        particleCount: 55,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#FF2A2E', '#10B981', '#06B6D4'],
      });

      showToast(`Signed in with Google as ${googleName}!`, 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Enter your email address above first, then click "Forgot password?".');
      return;
    }

    setErrorMessage('');
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      showToast(`Password reset link sent to ${trimmedEmail}.`, 'info');
    } catch (err) {
      setErrorMessage(formatFirebaseAuthError(err));
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserMetrics({
      name: fullName.trim() || user?.name || 'Athlete',
      gender: profileForm.gender,
      age: Number(profileForm.age) || 24,
      height: Number(profileForm.height) || 175,
      weight: Number(profileForm.weight) || 70.0,
      targetWeight: Number(profileForm.targetWeight) || 68.0,
      goal: profileForm.goal,
      activity: Number(profileForm.activity) || 1.55,
    });

    confetti({
      particleCount: 70,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#FF2A2E', '#10B981', '#06B6D4'],
    });

    showToast('Profile saved to your account! Your daily targets are ready.', 'success');
    if (onSuccess) onSuccess();
  };

  return (
    <div className="relative w-full max-w-[440px] bg-[#14151C] border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
      {/* Optional Close Button (Modal mode) */}
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-1.5 pr-8">
        <Zap className="w-5 h-5 text-[#FF2A2E] fill-[#FF2A2E]" />
        <span className="text-xl font-black text-white uppercase tracking-tight">
          MUSCLEUP<span className="text-[#FF2A2E]">.AI</span>
        </span>
      </div>
      <p className="text-sm text-white/60 mb-6 leading-snug">
        {resolvedSubtitle}
      </p>

      {step === 'credentials' ? (
        <>
          {/* Segmented Tab Switcher: LOG IN | CREATE ACCOUNT */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#1B1D24] rounded-2xl mb-5 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#FF2A2E] text-white shadow-[0_4px_18px_rgba(255,42,46,0.45)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              LOG IN
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-[#FF2A2E] text-white shadow-[0_4px_18px_rgba(255,42,46,0.45)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1B1D24] hover:bg-[#232631] disabled:opacity-60 border border-white/10 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-3 active:scale-[0.99] mb-5"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#14151C] px-3 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
              OR WITH EMAIL
            </span>
          </div>

          {/* Inline Error Alert */}
          {errorMessage && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aditya Jaiswal"
                  className="w-full px-4 py-3 rounded-2xl bg-[#1B1D24] border border-white/10 text-white placeholder-white/35 text-sm focus:outline-none focus:border-[#FF2A2E] transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-2xl bg-[#1B1D24] border border-white/10 text-white placeholder-white/35 text-sm focus:outline-none focus:border-[#FF2A2E] transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Password
                </label>
                {authMode === 'login' ? (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-[#FF2A2E] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                ) : strength.label ? (
                  <span className={`font-mono text-[11px] font-semibold ${strength.color}`}>
                    {strength.label}
                  </span>
                ) : null}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 pr-11 rounded-2xl bg-[#1B1D24] border border-white/10 text-white placeholder-white/35 text-sm focus:outline-none focus:border-[#FF2A2E] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#FF2A2E] hover:bg-[#FF4246] disabled:opacity-60 text-white font-black text-sm uppercase tracking-wider shadow-[0_8px_28px_rgba(255,42,46,0.45)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{authMode === 'login' ? 'LOGGING IN...' : 'CREATING ACCOUNT...'}</span>
                </>
              ) : (
                <span>{authMode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}</span>
              )}
            </button>
          </form>
        </>
      ) : (
        /* Quick Profile Setup Step (Matching Uniform Surface Tokens) */
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#1B1D24] border border-white/10">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, gender: g })}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      profileForm.gender === g
                        ? 'bg-[#FF2A2E] text-white shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                value={profileForm.age}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, age: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-2xl bg-[#1B1D24] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-white/75 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={profileForm.height}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, height: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2.5 rounded-2xl bg-[#1B1D24] border border-white/10 text-white font-mono text-sm text-center focus:outline-none focus:border-[#FF2A2E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/75 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={profileForm.weight}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, weight: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2.5 rounded-2xl bg-[#1B1D24] border border-white/10 text-white font-mono text-sm text-center focus:outline-none focus:border-[#FF2A2E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/75 mb-1">
                Goal (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={profileForm.targetWeight}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    targetWeight: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2.5 rounded-2xl bg-[#1B1D24] border border-white/10 text-white font-mono text-sm text-center focus:outline-none focus:border-[#FF2A2E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Primary Goal
            </label>
            <select
              value={profileForm.goal}
              onChange={(e) => setProfileForm({ ...profileForm, goal: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-[#1B1D24] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A2E] cursor-pointer"
            >
              <option value="loss">Lose Weight &amp; Fat</option>
              <option value="aggressive_loss">Fast Fat Loss</option>
              <option value="maintain">Maintain Weight</option>
              <option value="lean_bulk">Build Lean Muscle</option>
              <option value="mass_gain">Gain Strength &amp; Mass</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onSuccess) onSuccess();
              }}
              className="px-4 py-3.5 rounded-2xl bg-[#1B1D24] hover:bg-[#242733] border border-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-[#FF2A2E] hover:bg-[#FF4246] text-white font-black text-xs uppercase tracking-wider shadow-[0_8px_28px_rgba(255,42,46,0.45)] active:scale-[0.98] transition-all cursor-pointer"
            >
              Save &amp; Start Training
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
