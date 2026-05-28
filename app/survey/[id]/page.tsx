"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { backendApi } from "@/lib/api";

const APPLICATION_OPTIONS = [
  "OneConnect",
  "V-Rewards",
  "Pulse",
  "Compass",
  "Visitor Management System (VMS)",
  "Contract Management System (CMS)",
  "House of Ideas",
  "MyAssets",
  "eMbark",
];

const WORKS_WELL_OPTIONS = [
  "User-friendly interface (easy to navigate)",
  "Helps improve efficiency / saves time",
  "Reliable and stable performance",
  "Availability of useful features",
  "Good overall system performance",
];

const IMPROVEMENT_OPTIONS = [
  "Performance issues (slow response, lag)",
  "Complex or difficult to use",
  "Missing or insufficient features",
  "Bugs or technical errors",
  "Limited relevance to my work needs",
];

type Submission = {
  id: string;
  playerName: string;
  generatedImageUrl: string;
  challenge: {
    title: string;
    imageUrl: string;
  };
};

type SubmissionPayload = {
  status: "pending" | "finalized";
  submission: Submission;
};

function SurveyPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionExpired, setSubmissionExpired] = useState(false);
  const [applicationsUsed, setApplicationsUsed] = useState<string[]>([]);
  const [worksWellAspects, setWorksWellAspects] = useState<string[]>([]);
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);
  const [worksWellOther, setWorksWellOther] = useState("");
  const [improvementOther, setImprovementOther] = useState("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");

  function toggleMultiSelect(
    value: string,
    state: string[],
    setter: (next: string[]) => void,
  ) {
    if (state.includes(value)) {
      setter(state.filter((item) => item !== value));
      return;
    }

    setter([...state, value]);
  }

  useEffect(() => {
    let mounted = true;

    async function loadSubmission() {
      try {
        const sessionQuery = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
        const response = await fetch(backendApi(`/api/submission/${params.id}${sessionQuery}`), {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404 && mounted) {
            // Server likely restarted and lost in-memory store. Still show the form.
            setSubmissionExpired(true);
            setLoading(false);
            return;
          }
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Unable to load submission.");
        }

        const payload = (await response.json()) as SubmissionPayload;

        if (payload.status === "finalized") {
          router.replace(`/result/${params.id}`);
          return;
        }

        if (mounted) {
          setSubmission(payload.submission);
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load submission details.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      void loadSubmission();
    }

    return () => {
      mounted = false;
    };
  }, [params.id, router, sessionId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(backendApi("/api/survey"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          submissionId: submission?.id ?? params.id,
          applicationsUsed,
          worksWellAspects,
          improvementAreas,
          worksWellOther,
          improvementOther,
          additionalFeedback,
        }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = "Failed to submit feedback.";

        if (raw.trim()) {
          try {
            const payload = JSON.parse(raw) as { message?: string };
            message = payload.message ?? message;
          } catch {
            message = raw;
          }
        }

        throw new Error(message);
      }

      const payload = (await response.json()) as { resultUrl: string | null };
      router.replace(payload.resultUrl ?? "/join");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit feedback right now.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-white">
        <p className="animate-pulse text-lg tracking-wide text-white/80">Loading your survey...</p>
      </main>
    );
  }

  if (!submission && !submissionExpired) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-10 text-center sm:px-8">
        <p className="text-lg text-rose-200">{error ?? "Submission not found."}</p>
        <Link
          href="/join"
          className="mt-5 rounded-full border border-white/25 px-5 py-2 text-sm text-white/90 transition hover:border-white/60"
        >
          Back to Join
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 sm:px-8">
      <header className="mb-6 rounded-3xl border border-white/15 bg-white/5 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">One Final Step</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Quick Feedback Survey</h1>
        <p className="mt-2 text-sm text-white/75">
          Submit this survey to unlock your result details and publish your score on the leaderboard.
        </p>
      </header>

      <section className="rounded-3xl border border-white/15 bg-white/5 p-5">
        <aside>
          <form onSubmit={onSubmit} className="space-y-4">
            <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <legend className="px-2 text-sm font-semibold text-white/95">
                1. Which applications have you used? (Select all that apply)
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {APPLICATION_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={applicationsUsed.includes(option)}
                      onChange={() =>
                        toggleMultiSelect(option, applicationsUsed, setApplicationsUsed)
                      }
                      className="h-4 w-4 rounded border-white/20 bg-black/40"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <legend className="px-2 text-sm font-semibold text-white/95">
                2. What aspects of these applications work well? (Select all that apply)
              </legend>
              <div className="mt-2 space-y-2">
                {WORKS_WELL_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={worksWellAspects.includes(option)}
                      onChange={() =>
                        toggleMultiSelect(option, worksWellAspects, setWorksWellAspects)
                      }
                      className="h-4 w-4 rounded border-white/20 bg-black/40"
                    />
                    {option}
                  </label>
                ))}
              </div>
              <label className="mt-3 flex flex-col gap-2 text-sm text-white/85">
                Other (please specify)
                <input
                  value={worksWellOther}
                  onChange={(event) => setWorksWellOther(event.target.value)}
                  className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="Optional"
                />
              </label>
            </fieldset>

            <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <legend className="px-2 text-sm font-semibold text-white/95">
                3. What areas need improvement? (Select all that apply)
              </legend>
              <div className="mt-2 space-y-2">
                {IMPROVEMENT_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={improvementAreas.includes(option)}
                      onChange={() =>
                        toggleMultiSelect(option, improvementAreas, setImprovementAreas)
                      }
                      className="h-4 w-4 rounded border-white/20 bg-black/40"
                    />
                    {option}
                  </label>
                ))}
              </div>
              <label className="mt-3 flex flex-col gap-2 text-sm text-white/85">
                Other (please specify)
                <input
                  value={improvementOther}
                  onChange={(event) => setImprovementOther(event.target.value)}
                  className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="Optional"
                />
              </label>
            </fieldset>

            <label className="flex flex-col gap-2 text-sm text-white/85">
              4. Additional Feedback / Suggestions
              <textarea
                value={additionalFeedback}
                onChange={(event) => setAdditionalFeedback(event.target.value)}
                className="min-h-32 rounded-2xl border border-white/15 bg-black/30 px-3 py-3 text-base text-white outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Please share any detailed feedback, suggestions, or experiences."
              />
            </label>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200 px-6 py-3 text-base font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving Feedback..." : "Submit Survey and View Result"}
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center text-white">
          <p className="animate-pulse text-lg tracking-wide text-white/80">Loading your survey...</p>
        </main>
      }
    >
      <SurveyPageContent />
    </Suspense>
  );
}
