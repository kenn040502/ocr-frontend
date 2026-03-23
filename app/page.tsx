// app/page.tsx
"use client";
import { useState, useRef } from "react";

interface ExtractResponse {
  message: string;
  filename: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lastXpGain, setLastXpGain] = useState(0);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/extract`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Request failed");
      }
      const data: ExtractResponse = await res.json();
      setResult(data);
      setScans((prev) => prev + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
              🔍
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest text-white uppercase">
                OCR<span className="text-cyan-400">Scan</span>
              </h1>
              <p className="text-xs text-slate-500 tracking-wider">AI Text Extractor</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <div className="text-right">
              <p className="text-xs text-slate-500">Scans</p>
              <p className="text-sm font-bold text-cyan-400">{scans}</p>
            </div>
          </div>
        </div>
        {/* Upload zone — desktop only click-to-upload */}
        {!preview ? (
          <>
            <div
              onClick={() => uploadRef.current?.click()}
              className="hidden sm:flex border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-10 flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-slate-900/50 hover:bg-slate-900 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">📄</div>
              <p className="text-sm text-slate-400 mb-1">Drop an image or click to browse</p>
              <p className="text-xs text-slate-600">PNG, JPG, WEBP supported</p>
            </div>

            {/* Mobile: two buttons */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              <button
                onClick={() => uploadRef.current?.click()}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-semibold hover:bg-violet-500/20 transition-all"
              >
                <span>📁</span> Upload Image
              </button>
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-all"
              >
                <span>📷</span> Take Photo
              </button>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            </div>

            <input ref={uploadRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
            <img src={preview} alt="preview" className="w-full max-h-64 object-contain" />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-8 h-8 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white text-sm transition-all"
            >
              ✕
            </button>
          </div>
        )}

        {/* Extract button */}
        {file && !result && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all duration-200
              ${loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
                Scanning...
              </span>
            ) : (
              "⚡ Extract Text"
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-400 flex gap-2 items-start">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-slate-900 border border-emerald-500/25 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/15">
              <div className="flex items-center gap-2 text-xs text-emerald-400 uppercase tracking-widest font-semibold">
                <span>✅</span> Extracted Text
              </div>
            </div>

            <div className="px-4 py-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono max-h-72 overflow-y-auto">
              {result.message}
            </div>

            <div className="flex gap-2 px-4 py-3 border-t border-slate-800">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
              >
                {copied ? "✓ Copied!" : "📋 Copy Text"}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all"
              >
                🔄 Scan Again
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}