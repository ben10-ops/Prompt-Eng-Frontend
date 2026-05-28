"use client";

import { useEffect, useMemo, useState } from "react";
import { backendApi } from "@/lib/api";

type Challenge = {
  id: string;
  title: string;
  imageUrl: string;
  category: "easy" | "medium" | "hard";
};

type Submission = {
  id: string;
  playerName: string;
  prompt: string;
  generatedImageUrl: string;
  scores: {
    similarity: number;
    promptQuality: number;
    styleAlignment: number;
    detailCoverage: number;
    finalScore: number;
  };
  persona: {
    tier: string;
    styleTag: string;
  };
};

type StatePayload = {
  challenge: Challenge;
  leaderboard: Submission[];
  recentResults: Submission[];
  latest: Submission | null;
};

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 80) return "text-cyan-300";
  if (score >= 70) return "text-amber-200";
  return "text-rose-300";
}

export default function ScreenPage() {
  const [state, setState] = useState<StatePayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        const response = await fetch(backendApi("/api/state"), { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const payload = (await response.json()) as StatePayload;
        if (!mounted) {
          return;
        }

        setState(payload);
        setLoadError(null);
      } catch {
        if (!mounted) {
          return;
        }

        setLoadError("Backend is offline. Start backend on port 4000.");
      }
    }

    void loadState();
    const poll = setInterval(loadState, 4000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, []);

  const recentResults = state?.recentResults ?? [];
  const carouselResults = (() => {
    if (recentResults.length <= 1) return recentResults;
    return [...recentResults, recentResults[0]];
  })();

  useEffect(() => {
    if (recentResults.length <= 1) return;

    const rotate = setInterval(() => {
      setIsSliding(true);
      setCarouselIndex((current) => current + 1);
    }, 4000);

    return () => clearInterval(rotate);
  }, [recentResults.length]);

  const activeResult = recentResults.length
    ? recentResults[carouselIndex % recentResults.length]
    : null;

  const joinUrl = useMemo(() => {
    if (typeof window === "undefined") return "/join";
    return `${window.location.origin}/join`;
  }, []);

  function handleCarouselTransitionEnd() {
    if (recentResults.length <= 1) return;
    if (carouselIndex !== recentResults.length) return;

    setIsSliding(false);
    setCarouselIndex(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsSliding(true);
      });
    });
  }

  if (!state) {
    return (
      <main className="grid min-h-screen place-items-center text-white">
        <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-center">
          <p className="animate-pulse text-lg tracking-wide text-white/80">Booting main screen...</p>
          {loadError ? <p className="mt-2 text-sm text-rose-300">{loadError}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 py-7 lg:px-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/5 px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Prompt Wars Live</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Can You Think Like AI?</h1>
        </div>
        {loadError ? <p className="text-sm text-rose-300">{loadError}</p> : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-white/15 bg-white/5">
          <div className="grid gap-4 p-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/60">Target Image</p>
              <div className="relative h-[46vh] min-h-[340px] overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                <img
                  src={state.challenge.imageUrl}
                  alt={state.challenge.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/60">Live User Results</p>
              {activeResult ? (
                <div className="relative h-[34vh] min-h-[260px] overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                  <div
                    onTransitionEnd={handleCarouselTransitionEnd}
                    className={`flex h-full ${isSliding ? "transition-transform duration-700 ease-in-out" : ""}`}
                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                  >
                    {carouselResults.map((result, index) => (
                      <img
                        key={`${result.id}-${index}`}
                        src={result.generatedImageUrl}
                        alt={`Generated by ${result.playerName}`}
                        className="h-full min-w-full object-cover object-center"
                      />
                    ))}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-sm text-white/95">
                    {activeResult.playerName} • Score {activeResult.scores.finalScore} • {(carouselIndex % recentResults.length) + 1}/{recentResults.length}
                  </div>
                </div>
              ) : (
                <div className="grid h-[34vh] min-h-[260px] place-items-center rounded-2xl border border-dashed border-white/20 text-white/60">
                  Waiting for first user submission
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 p-5">
            <p className="text-sm text-white/70">Challenge</p>
            <h2 className="mt-1 text-2xl font-semibold">{state.challenge.title}</h2>
            {state.latest ? (
              <div className="mt-4 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
                <p>
                  Latest User: <span className="font-medium text-white">{state.latest.playerName}</span>
                </p>
                <p>
                  Score: <span className={`font-semibold ${scoreColor(state.latest.scores.finalScore)}`}>{state.latest.scores.finalScore}</span>
                </p>
                <p className="sm:col-span-2">
                  Persona: <span className="font-medium text-cyan-200">{state.latest.persona.tier}</span> • {state.latest.persona.styleTag}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/15 bg-white/5 p-5">
            <h3 className="text-sm uppercase tracking-[0.25em] text-white/70">Leaderboard</h3>
            <div className="mt-4 space-y-2">
              {state.leaderboard.length === 0 ? (
                <p className="text-sm text-white/60">No users yet. Scan and submit to begin.</p>
              ) : (
                state.leaderboard.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                    <p className="text-sm text-white/85">
                      {index + 1}. {user.playerName}
                    </p>
                    <p className={`text-sm font-semibold ${scoreColor(user.scores.finalScore)}`}>{user.scores.finalScore}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-cyan-200/30 bg-cyan-300/10 p-5">
            <h3 className="text-sm uppercase tracking-[0.25em] text-cyan-100">Scan To Submit Prompt</h3>
            <div className="mt-4 flex items-center gap-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(joinUrl)}`}
                alt="Prompt Submission QR"
                className="h-32 w-32 rounded-xl bg-white p-1"
              />
              <div className="space-y-2">
                <p className="text-sm text-cyan-50/90">Scan this QR from your phone to open the prompt submission page.</p>
                <p className="text-xs text-cyan-100/80">URL: {joinUrl}</p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
