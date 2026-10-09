"use client";

import { useState } from "react";

import { Win98Icon } from "@/components/win98-icon";

import type { MasterResume } from "@/schemas/master-resume";

import styles from "@/styles/win98.module.css";

type Props = {
  resume: MasterResume;

  onResumeChange: (resume: MasterResume) => void;

  onMessage: (message: string | null) => void;

  onError: (message: string | null) => void;
};

type Dialog = "generate" | "review" | null;

type ApiResponse = {
  resume?: MasterResume;
  error?: string;
};

export function MasterResumeAiActions({
  resume,
  onResumeChange,
  onMessage,
  onError,
}: Props) {
  const [dialog, setDialog] = useState<Dialog>(null);

  const [story, setStory] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  function closeDialog() {
    if (isProcessing) {
      return;
    }

    setDialog(null);
  }

  async function generateResume() {
    if (story.trim().length < 50) {
      onError(
        "Tell a little more of your career story before generating the master resume.",
      );

      return;
    }

    setIsProcessing(true);
    onError(null);
    onMessage(null);

    try {
      const response = await fetch("/api/master-resume/generate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          story,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not generate the master resume.");
      }

      if (!data.resume) {
        throw new Error("Generated master resume response is incomplete.");
      }

      onResumeChange(data.resume);

      onMessage(
        "Generated master resume loaded into the editor. Review the fields and click Save master resume when ready.",
      );

      setDialog(null);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Could not generate the master resume.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function reviewResume() {
    setIsProcessing(true);
    onError(null);
    onMessage(null);

    try {
      const response = await fetch("/api/master-resume/review", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          resume,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not review the master resume.");
      }

      if (!data.resume) {
        throw new Error("Reviewed master resume response is incomplete.");
      }

      onResumeChange(data.resume);

      onMessage(
        "Writing review loaded into the editor. Factual fields were preserved. Review the changes and click Save master resume when ready.",
      );

      setDialog(null);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Could not review the master resume.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onError(null);
            onMessage(null);

            setDialog("generate");
          }}
          className={styles.button}
        >
          <Win98Icon name="sparkle" />
          Generate automatically
        </button>

        <button
          type="button"
          onClick={() => {
            onError(null);
            onMessage(null);

            setDialog("review");
          }}
          className={styles.button}
        >
          <Win98Icon name="analysis" />
          Review writing
        </button>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`${styles.window} w-full ${dialog === "generate" ? "max-w-3xl" : "max-w-xl"
              }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="master-resume-ai-dialog-title"
          >
            <div className={styles.titleBar}>
              <Win98Icon
                name={dialog === "generate" ? "sparkle" : "analysis"}
              />

              <span id="master-resume-ai-dialog-title" className="flex-1">
                {dialog === "generate"
                  ? "Tell me your career story"
                  : "Review master resume"}
              </span>

              <button
                type="button"
                onClick={closeDialog}
                disabled={isProcessing}
                aria-label="Close"
                className="inline-flex h-5 w-5 items-center justify-center bg-[#c0c0c0] text-black disabled:opacity-50"
                style={{
                  borderTop: "2px solid #ffffff",

                  borderLeft: "2px solid #ffffff",

                  borderRight: "2px solid #000000",

                  borderBottom: "2px solid #000000",
                }}
              >
                <Win98Icon name="close" size={10} />
              </button>
            </div>

            <div className={styles.windowBody}>
              {dialog === "generate" ? (
                <GenerateDialog
                  story={story}
                  onStoryChange={setStory}
                  isProcessing={isProcessing}
                  onCancel={closeDialog}
                  onGenerate={generateResume}
                />
              ) : (
                <ReviewDialog
                  isProcessing={isProcessing}
                  onCancel={closeDialog}
                  onReview={reviewResume}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GenerateDialog({
  story,
  onStoryChange,
  isProcessing,
  onCancel,
  onGenerate,
}: {
  story: string;

  onStoryChange: (value: string) => void;

  isProcessing: boolean;

  onCancel: () => void;

  onGenerate: () => void;
}) {
  return (
    <>
      <p className="mb-3 leading-5">
        Tell your career story in your own words. Include anything you consider
        relevant: education, professional experience, projects, technologies,
        skills, achievements and career goals.
      </p>

      <p className="mb-3 leading-5 text-[#404040]">
        You do not need to write it like a resume. Codex will organize the
        factual information and improve the writing for resume and ATS
        readability. Missing information will not be invented.
      </p>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Career story</span>

        <textarea
          value={story}
          onChange={(event) => onStoryChange(event.target.value)}
          disabled={isProcessing}
          rows={18}
          autoFocus
          placeholder="I started programming when... Later I studied... My first professional experience was..."
          className={styles.textarea}
        />
      </label>

      <div className="mt-3 border border-[#808080] bg-[#ffffe1] px-2 py-2 text-[11px] leading-4">
        The generated draft will replace the values currently shown in the
        editor, but master-resume.json will not be changed until you click Save
        master resume.
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className={styles.button}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isProcessing || story.trim().length < 50}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          <Win98Icon name="sparkle" />

          {isProcessing ? "Generating..." : "Generate resume"}
        </button>
      </div>
    </>
  );
}

function ReviewDialog({
  isProcessing,
  onCancel,
  onReview,
}: {
  isProcessing: boolean;

  onCancel: () => void;

  onReview: () => void;
}) {
  return (
    <>
      <p className="leading-5">
        Codex will review the current master resume and improve its writing for
        clarity, concision, professional resume language and ATS readability.
      </p>

      <div className="my-4 border border-[#808080] bg-white px-3 py-3 leading-5">
        <strong>Factual information is protected.</strong>

        <p className="mt-2 mb-0">
          Employers, roles, dates, locations, technologies, skills, education,
          projects, language proficiency, IDs and other factual fields will
          remain unchanged.
        </p>
      </div>

      <p className="text-[#404040]">
        The reviewed version will be loaded into the editor first. Nothing is
        written to master-resume.json until you click Save master resume.
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className={styles.button}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onReview}
          disabled={isProcessing}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          <Win98Icon name="analysis" />

          {isProcessing ? "Reviewing..." : "Review resume"}
        </button>
      </div>
    </>
  );
}
