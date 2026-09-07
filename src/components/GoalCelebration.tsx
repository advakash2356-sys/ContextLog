import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Trophy,
  Sparkles,
  ArrowUpRight,
  Check,
  PartyPopper,
  Zap,
  TrendingUp,
  Plus,
  Minus
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GoalCelebrationProps {
  completedSessions: number;
  dailyGoal: number;
  onUpdateDailyGoal?: (newGoal: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRotation: number;
  alpha: number;
  shape: 'rect' | 'circle' | 'ribbon';
}

export const GoalCelebration: React.FC<GoalCelebrationProps> = ({
  completedSessions,
  dailyGoal,
  onUpdateDailyGoal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState<string | null>(null);
  const isGoalHit = dailyGoal > 0 && completedSessions >= dailyGoal;
  const suggestedTomorrowGoal = dailyGoal + 1;
  const stretchTomorrowGoal = dailyGoal + 2;

  // Particle explosion animation engine
  const triggerConfetti = useCallback(() => {
    setIsPlayingAnimation(true);
    soundManager.playCelebrationFanfare();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const colors = ['#10B981', '#38BDF8', '#818CF8', '#F59E0B', '#EC4899', '#8B5CF6', '#FBBF24', '#34D399'];
    const particles: Particle[] = [];
    const particleCount = 70;

    const originX = rect.width / 2;
    const originY = rect.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5, // initial upward lift
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 12,
        alpha: 1,
        shape: Math.random() > 0.6 ? 'circle' : Math.random() > 0.3 ? 'rect' : 'ribbon',
      });
    }

    let animationFrameId: number;
    const gravity = 0.18;
    const drag = 0.985;
    const startTime = performance.now();
    const duration = 2800; // ms

    const render = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, rect.width, rect.height);

      let aliveCount = 0;
      for (const p of particles) {
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRotation;
        p.alpha = Math.max(0, 1 - progress * 1.1);

        if (p.alpha > 0.01 && p.y < rect.height + 40) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          } else {
            ctx.fillRect(-p.size, -p.size / 4, p.size * 2, p.size / 2);
          }
          ctx.restore();
        }
      }

      if (progress < 1 && aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
        setIsPlayingAnimation(false);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Auto trigger confetti once when mounted if goal is met
  useEffect(() => {
    if (isGoalHit) {
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isGoalHit, triggerConfetti]);

  // Handle goal increment action
  const handleApplyGoal = (newGoal: number, label: string) => {
    if (onUpdateDailyGoal) {
      onUpdateDailyGoal(Math.max(1, newGoal));
      soundManager.playCheckSound();
      setGoalFeedback(`Tomorrow's target updated to ${newGoal} sessions (${label})! 🎯`);
      setTimeout(() => setGoalFeedback(null), 4000);
    }
  };

  if (!isGoalHit) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/40 border-2 border-emerald-500/30 dark:border-emerald-500/40 p-5 sm:p-7 shadow-xl shadow-emerald-500/5 animate-celebration-pop">
      {/* Canvas for particle fireworks micro-interaction */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full z-20"
      />

      {/* Decorative ambient blurred orbs */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-indigo-500/15 blur-3xl" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-500/20 dark:border-emerald-500/30">
        <div className="flex items-center space-x-3.5">
          {/* Animated Gold Trophy Icon with Shimmer */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 animate-float-sparkle">
              <Trophy className="w-7 h-7 fill-slate-950/20 stroke-[2.2]" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 text-[10px] text-white font-black items-center justify-center shadow-sm">
                ✓
              </span>
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Daily Focus Goal Achieved!
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-xs">
                {completedSessions}/{dailyGoal} Sessions
              </span>
              {completedSessions > dailyGoal && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  +{completedSessions - dailyGoal} Bonus 🔥
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Outstanding work! You have crushed today's target focus sessions with high discipline.
            </p>
          </div>
        </div>

        {/* Replay Confetti Action Button */}
        <button
          onClick={triggerConfetti}
          disabled={isPlayingAnimation}
          className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm transition-all interactive-spring"
          title="Replay Celebration"
        >
          <PartyPopper className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isPlayingAnimation ? 'animate-bounce' : ''}`} />
          <span>{isPlayingAnimation ? 'Celebrating... 🎉' : 'Replay Celebration 🎉'}</span>
        </button>
      </div>

      {/* Suggested Incremental Increase for Following Day */}
      <div className="relative z-10 mt-5 pt-1 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Suggested Next-Day Incremental Increase
            </h4>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Progressive Overload for Focus
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Consistent micro-habits compound rapidly. Since you easily met your goal of{' '}
          <strong className="text-slate-900 dark:text-slate-100">{dailyGoal} sessions</strong> today,
          we recommend scaling up tomorrow's target by <strong className="text-emerald-600 dark:text-emerald-400">+1 session</strong> ({suggestedTomorrowGoal} sessions) to expand your focus capacity.
        </p>

        {/* Dynamic Feedback Notification */}
        {goalFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-200">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{goalFeedback}</span>
          </div>
        )}

        {/* Action Buttons for Incremental Increase */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Primary Recommended Option (+1) */}
          <button
            onClick={() => handleApplyGoal(suggestedTomorrowGoal, '+1 Increment')}
            className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all interactive-spring"
          >
            <Sparkles className="w-4 h-4" />
            <span>Level Up: Set {suggestedTomorrowGoal} Sessions for Tomorrow</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Secondary Stretch Option (+2) */}
          <button
            onClick={() => handleApplyGoal(stretchTomorrowGoal, '+2 Stretch')}
            className="flex items-center space-x-1.5 py-2.5 px-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all interactive-spring"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Stretch Target (+2: {stretchTomorrowGoal} sessions)</span>
          </button>

          {/* Stepper Fine-Tuner */}
          {onUpdateDailyGoal && (
            <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleApplyGoal(Math.max(1, dailyGoal - 1), 'Custom')}
                disabled={dailyGoal <= 1}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                title="Decrease goal"
                aria-label="Decrease daily goal"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200">
                {dailyGoal}
              </span>
              <button
                onClick={() => handleApplyGoal(dailyGoal + 1, 'Custom +1')}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Increase goal"
                aria-label="Increase daily goal"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
