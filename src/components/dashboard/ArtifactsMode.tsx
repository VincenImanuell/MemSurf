"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileBox, Upload, Loader2, AlertCircle, ExternalLink, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callMemWal } from "@/lib/api";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB cap (JSON body)
const AGG = "https://aggregator.walrus-testnet.walrus.space/v1/blobs";

interface Artifact {
  blobId: string;
  label: string;
}

function parseArtifact(text: string): Artifact | null {
  const blob = text.match(/blob:([A-Za-z0-9_-]+)/)?.[1];
  if (!blob) return null;
  const label = text.replace(/\.?\s*stored on Walrus\.?\s*blob:[A-Za-z0-9_-]+/, "").trim();
  return { blobId: blob, label: label || "Artifact" };
}

export function ArtifactsMode({ active = true }: { active?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const refresh = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await callMemWal<{ memories: { text: string }[] }>("discover", { namespace: "artifacts" });
      const parsed = data.memories.map((m) => parseArtifact(m.text)).filter(Boolean) as Artifact[];
      setArtifacts(parsed);
    } catch {
      // keep silent on list errors
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (active) refresh();
  }, [refresh, active]);

  const handleFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      setError("File too large (max 2 MB for the demo).");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const dataBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      await callMemWal("upload-artifact", {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        dataBase64,
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-serif text-navy flex items-center gap-2 dark:text-white">
          <FileBox className="w-5 h-5 text-ocean" />
          Artifacts on Walrus
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loadingList}
          className="border-ocean/20 text-ocean hover:bg-ocean/5 rounded-xl dark:border-white/10 dark:bg-white/5 dark:text-sky-200 dark:hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loadingList ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <p className="text-navy/50 text-sm font-light mb-6 dark:text-white/50">
        Store files an agent generates — datasets, logs, reports — <span className="font-medium text-navy dark:text-white">directly on Walrus</span> (via the public testnet publisher), with a reference memory so they&apos;re discoverable.
      </p>

      {/* Upload zone */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-ocean/20 p-8 text-center mb-6 transition-colors hover:border-ocean/40 dark:bg-slate-900 dark:border-white/15">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <FileBox className="w-10 h-10 mx-auto mb-3 text-ocean/40" />
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-gradient-to-r from-ocean to-wave text-white rounded-xl px-6 py-5 font-semibold hover:opacity-90"
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {uploading ? "Uploading to Walrus…" : "Upload a file"}
        </Button>
        <p className="text-xs text-navy/40 mt-3 dark:text-white/40">Max 2 MB · stored on Walrus testnet for 5 epochs</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 dark:bg-red-500/10 dark:border-red-400/20 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {artifacts.length === 0 && !loadingList ? (
        <div className="text-center py-8 text-navy/40 dark:text-white/40">
          <FileBox className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No artifacts yet. Upload one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {artifacts.map((a, i) => (
            <motion.div
              key={a.blobId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-ocean/10 p-4 flex items-center justify-between gap-3 dark:bg-slate-900 dark:border-white/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-ocean shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-navy truncate dark:text-white/85">{a.label}</p>
                  <p className="text-xs font-mono text-navy/40 truncate dark:text-white/35">{a.blobId.slice(0, 20)}…</p>
                </div>
              </div>
              <a
                href={`${AGG}/${a.blobId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-ocean hover:text-ocean-deep font-medium shrink-0 dark:text-sky-300"
              >
                Download <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
