"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { backendApi } from "@/lib/api";

type SubmitResult = {
  pendingId: string;
  surveyUrl: string;
};

export default function JoinPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);

  const promptHints = useMemo(
    () => [
      "Mention camera angle and lens behavior",
      "Describe mood, shadows, reflections, and atmosphere",
      "Include enterprise context and scene composition",
    ],
    [],
  );

  useEffect(() => {
    if (timerStartedAt === null || isExpired) {
      return;
    }

    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        setError("Your 1-minute entry window has expired. Please refresh to try again.");
      }
    }, 250);

    return () => clearInterval(tick);
  }, [isExpired, timerStartedAt]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isExpired) {
      setError("Your 1-minute entry window has expired. Please refresh to try again.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const backendResponse = await fetch(backendApi("/api/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, prompt }),
      });

      if (!backendResponse.ok) {
        const payload = (await backendResponse.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to submit prompt.");
      }

      const payload = (await backendResponse.json()) as SubmitResult;
      router.push(payload.surveyUrl);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Join Prompt Wars</h1>
        <Link
          href="/screen"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
        >
          View Main Screen
        </Link>
      </div>

      <div className="mb-4 rounded-2xl border border-amber-200/35 bg-amber-300/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-100/85">Your Timer</p>
        <p className={`mt-1 text-3xl font-semibold ${secondsLeft <= 10 ? "text-rose-300" : "text-amber-100"}`}>
          00:{String(secondsLeft).padStart(2, "0")}
        </p>
        <p className="mt-1 text-xs text-amber-50/80">
          Timer starts as soon as you enter your name. You have only 1 minute to submit.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-white/15 bg-white/5 p-6">
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Your Name
          <input
            value={playerName}
            onChange={(event) => {
              const nextName = event.target.value;
              setPlayerName(nextName);

              if (timerStartedAt === null && nextName.trim()) {
                setTimerStartedAt(Date.now());
              }
            }}
            className="rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-base text-white outline-none ring-emerald-300 transition focus:ring-2"
            placeholder="Alex"
            required
            disabled={loading || isExpired}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          Your Prompt
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="min-h-44 rounded-2xl border border-white/15 bg-black/30 px-3 py-3 text-base text-white outline-none ring-emerald-300 transition focus:ring-2"
            placeholder="Cinematic futuristic enterprise control room, volumetric rim lighting, reflective floor, wide angle composition, ultra realistic detail, holographic dashboards"
            required
            disabled={loading || isExpired}
          />
        </label>

        <div className="rounded-2xl bg-black/25 p-4 text-sm text-white/75">
          <p className="mb-2 font-medium text-white">Prompt Tips</p>
          <ul className="space-y-1">
            {promptHints.map((hint) => (
              <li key={hint}>- {hint}</li>
            ))}
          </ul>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || isExpired}
          className="w-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 px-6 py-3 text-base font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating..." : "Submit Prompt"}
        </button>
      </form>
    </main>
  );
}
