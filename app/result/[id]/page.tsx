import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVER_BACKEND_URL } from "@/lib/api";

type ResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ResultSubmission = {
  id: string;
  playerName: string;
  prompt: string;
  generatedImageUrl: string;
  challenge: {
    title: string;
    imageUrl: string;
  };
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
    characterName: string;
    characterUrl: string;
    dnaInsight: string;
  };
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;
  const response = await fetch(`${SERVER_BACKEND_URL}/api/submission/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const payload = (await response.json()) as {
    status: "pending" | "finalized";
    submission: ResultSubmission;
  };

  if (payload.status !== "finalized") {
    notFound();
  }

  const submission = payload.submission;

  if (!submission) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/5 px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">AI Identity Claimed</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{submission.playerName}</h1>
          <p className="mt-1 text-sm text-white/70">Single-player submission</p>
        </div>
        <Link
          href="/screen"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
        >
          Back to Main Screen
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-3xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">Original vs Generated</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/60">Original</p>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                <img
                  src={submission.challenge.imageUrl}
                  alt={submission.challenge.title}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/60">Generated</p>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                <img
                  src={submission.generatedImageUrl}
                  alt={`Generated for ${submission.playerName}`}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Submitted Prompt</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/90">{submission.prompt}</p>
          </div>
        </article>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-white/15 bg-white/5 p-5">
            <h3 className="text-sm uppercase tracking-[0.25em] text-white/70">Score Breakdown</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Similarity" value={submission.scores.similarity} />
              <Metric label="Prompt Quality" value={submission.scores.promptQuality} />
              <Metric label="Style Alignment" value={submission.scores.styleAlignment} />
              <Metric label="Detail Coverage" value={submission.scores.detailCoverage} />
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-200/35 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">Final Score</p>
              <p className="mt-1 text-4xl font-semibold text-emerald-200">{submission.scores.finalScore}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-cyan-200/35 bg-cyan-300/10 p-5">
            <h3 className="text-sm uppercase tracking-[0.25em] text-cyan-100">AI Collaboration Identity</h3>
            <div className="mt-4 flex items-center gap-4">
              <img
                src={submission.persona.characterUrl}
                alt={submission.persona.characterName}
                className="h-20 w-20 rounded-2xl bg-white/90 p-2"
              />
              <div>
                <p className="text-lg font-semibold text-cyan-50">{submission.persona.tier}</p>
                <p className="text-sm text-cyan-100/85">{submission.persona.styleTag}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-cyan-50/90">{submission.persona.dnaInsight}</p>
          </section>
        </aside>
      </section>
    </main>
  );
}
