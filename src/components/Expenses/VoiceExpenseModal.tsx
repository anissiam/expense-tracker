import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { parseVoiceTranscript, transcribeAudio } from '../../services/apiService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioRecorder, blobToBase64 } from '../../hooks/useAudioRecorder';
import { playVoiceStartCue, playVoiceStopCue } from '../../utils/voiceCues';
import { PaymentMethod } from '../../types';
import {
  Mic,
  Square,
  X,
  Check,
  Sparkles,
  PencilLine,
  AlertTriangle,
  AudioLines,
  Loader2,
} from 'lucide-react';

interface VoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'capture' | 'review';

export const VoiceExpenseModal: React.FC<VoiceExpenseModalProps> = ({ isOpen, onClose }) => {
  const { categories, addExpense, currency } = useExpense();
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition();

  const [step, setStep] = useState<Step>('capture');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const audio = useAudioRecorder();
  const [clarification, setClarification] = useState<{ missingField: string; prompt: string } | null>(null);

  // Review fields (editable — user correction wins over parser output)
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const activeCategory = categories.find((c) => c.id === categoryId);

  const resetAll = () => {
    resetTranscript();
    setStep('capture');
    setParseError(null);
    setTranscribeError(null);
    setIsTranscribing(false);
    setClarification(null);
    setAmount('');
    setCategoryId('');
    setSubcategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPaymentMethod('cash');
    setIsSaving(false);
  };

  const handleClose = () => {
    if (isListening) stopListening();
    if (audio.isRecording) void audio.stopRecording();
    audio.clearError();
    resetAll();
    onClose();
  };

  const formatRecordTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Server-side fallback: record locally, transcribe via /api/ai/transcribe.
  const handleRecordToggle = async () => {
    if (isTranscribing) return;
    if (audio.isRecording) {
      const blob = await audio.stopRecording();
      playVoiceStopCue();
      if (!blob) {
        setTranscribeError('Empty recording — try again, or type instead.');
        return;
      }
      setIsTranscribing(true);
      setTranscribeError(null);
      try {
        const base64 = await blobToBase64(blob);
        const text = await transcribeAudio(base64, blob.type || 'audio/webm');
        setTranscript(text);
      } catch (err: any) {
        setTranscribeError(err?.message || 'Transcription failed. Try again or type instead.');
      } finally {
        setIsTranscribing(false);
      }
      return;
    }
    if (isListening) stopListening();
    setTranscribeError(null);
    playVoiceStartCue();
    await audio.startRecording();
  };

  const applyParseResult = (result: any) => {
    if (result.status === 'NEEDS_CLARIFICATION') {
      setClarification({ missingField: result.missingField, prompt: result.prompt });
      // Pre-fill whatever was detected so clarification is one tap/field.
      if (result.amount) setAmount(String(result.amount));
      if (result.category_id) setCategoryId(String(result.category_id));
      if (result.subcategory_id) setSubcategoryId(String(result.subcategory_id));
      if (result.date) setDate(result.date);
      if (result.description) setDescription(result.description);
      setStep('review');
      return;
    }
    setClarification(null);
    setAmount(result.amount != null ? String(result.amount) : '');
    setCategoryId(result.category_id ? String(result.category_id) : categories[0]?.id || '');
    setSubcategoryId(result.subcategory_id ? String(result.subcategory_id) : '');
    setDate(result.date || new Date().toISOString().split('T')[0]);
    setDescription(result.description || '');
    setStep('review');
  };

  const handleParse = async () => {
    if (isListening) stopListening();
    if (!transcript.trim()) {
      setParseError('Speak or type an expense first (e.g. "Yesterday I spent 15 dollars on coffee").');
      return;
    }
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseVoiceTranscript(transcript.trim());
      applyParseResult(result);
    } catch (err: any) {
      setParseError(err?.message || 'Could not parse that expense. Try rephrasing with an amount and category.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Enter a valid positive amount before confirming.');
      return;
    }
    if (!categoryId) {
      alert('Pick a category before confirming.');
      return;
    }
    setIsSaving(true);
    try {
      await addExpense({
        title: description.trim() || 'Voice expense',
        amount: parsedAmount,
        date,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        paymentMethod,
        notes: `Voice: "${transcript.trim()}"`,
        source: 'voice',
      });
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1E2B21]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-3">
          <h3 className="text-xl font-serif font-bold text-[#1E2922] flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#28372B]" />
            Voice Expense
          </h3>
          <button onClick={handleClose} className="text-[#627064] hover:text-[#1E2922]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'capture' && (
          <div className="space-y-4">
            <div className="flex items-start justify-center gap-4 py-2">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      playVoiceStopCue();
                      stopListening();
                    } else {
                      playVoiceStartCue();
                      startListening();
                    }
                  }}
                  disabled={audio.isRecording || isTranscribing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md disabled:opacity-40 ${
                    isListening
                      ? 'bg-rose-700 text-white animate-pulse'
                      : 'bg-[#28372B] hover:bg-[#1F2B21] text-amber-200'
                  }`}
                  aria-label={isListening ? 'Stop live speech' : 'Start live speech'}
                  title="Live speech (browser cloud service)"
                >
                  {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#627064] font-bold text-center">
                  {isListening ? 'Listening… tap to stop' : 'Live speech'}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecordToggle}
                  disabled={isListening || isTranscribing || !audio.isSupported}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md disabled:opacity-40 ${
                    audio.isRecording
                      ? 'bg-rose-700 text-white animate-pulse'
                      : 'bg-[#8C5D4B] hover:bg-[#7a5040] text-amber-100'
                  }`}
                  aria-label={audio.isRecording ? 'Stop recording' : 'Record audio for transcription'}
                  title="Record audio, transcribe on our server (works when live speech is blocked)"
                >
                  {isTranscribing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : audio.isRecording ? (
                    <Square className="w-6 h-6" />
                  ) : (
                    <AudioLines className="w-6 h-6" />
                  )}
                </button>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#627064] font-bold text-center">
                  {isTranscribing
                    ? 'Transcribing…'
                    : audio.isRecording
                      ? `● ${formatRecordTime(audio.recordingSeconds)} — tap to stop`
                      : 'Record & transcribe'}
                </p>
              </div>
            </div>
            {audio.error && (
              <p className="text-xs font-mono text-amber-800 bg-amber-100 border border-amber-300 rounded-2xl px-3 py-2">
                {audio.error}
              </p>
            )}
            {transcribeError && (
              <p className="text-xs font-mono text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2">
                {transcribeError}
              </p>
            )}

            <div>
              <label className="text-xs font-mono font-bold text-[#627064] uppercase flex items-center gap-1 mb-1">
                <PencilLine className="w-3.5 h-3.5" />
                Voice transcript (editable — no mic needed for testing)
              </label>
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder='e.g. "Yesterday I spent 15 dollars on coffee"'
                className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Bought groceries for 25 dollars',
                  'Yesterday I spent 15 dollars on coffee',
                  'I spent 20 dollars today',
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setTranscript(example)}
                    className="text-[10px] font-mono px-2 py-1 rounded-full bg-[#EAE5DC] hover:bg-[#E2DDD3] border border-[#DCD5C8] text-[#354238] transition"
                  >
                    Try: “{example}”
                  </button>
                ))}
              </div>
              {!isSupported && (
                <p className="text-[11px] font-mono text-[#627064] mt-1.5">
                  This browser has no speech recognition (use Chrome/Edge for the mic) — typing above tests the
                  same parser end to end.
                </p>
              )}
            </div>

            {speechError && (
              <p className="text-xs font-mono text-amber-800 bg-amber-100 border border-amber-300 rounded-2xl px-3 py-2">
                {speechError}
              </p>
            )}
            {parseError && (
              <p className="text-xs font-mono text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2">
                {parseError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] text-xs font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParse}
                disabled={isParsing || !transcript.trim()}
                className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] disabled:opacity-50 text-amber-100 text-xs font-serif font-bold shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isParsing ? 'Parsing…' : 'Parse expense'}
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <form onSubmit={handleConfirm} className="space-y-4">
            {clarification && (
              <div className="flex items-start gap-2 bg-amber-100 border border-amber-300 rounded-2xl px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">{clarification.prompt}</span>
                  <span className="block font-mono mt-0.5 opacity-80">
                    Heard: “{transcript.trim()}” — fill in the missing field below, then confirm.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] font-serif font-extrabold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs font-mono text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs text-[#1E2922] font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                >
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">Subcategory</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs text-[#1E2922] font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                >
                  <option value="">(None)</option>
                  {activeCategory?.subcategories?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Coffee"
                className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">Heard transcript</label>
              <p className="text-xs font-mono text-[#627064] bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3 py-2 italic">
                “{transcript.trim()}”
              </p>
            </div>

            <div className="flex justify-between gap-3 pt-3 border-t border-[#E8E2D7]">
              <button
                type="button"
                onClick={() => {
                  setStep('capture');
                  setClarification(null);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] text-xs font-mono font-bold"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] disabled:opacity-50 text-amber-100 text-xs font-serif font-bold shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isSaving ? 'Saving…' : 'Confirm & Add Expense'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
