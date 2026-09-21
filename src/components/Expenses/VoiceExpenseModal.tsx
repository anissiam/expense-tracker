import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { parseVoiceTranscript, transcribeAudio } from '../../services/apiService';
import { translateDataName } from '../../data/categoryTranslations';
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
  const { categories, addExpense, currency, language, t } = useExpense();
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition(language);

  const [step, setStep] = useState<Step>('capture');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const audio = useAudioRecorder(language);
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
        setTranscribeError(t.emptyRecordingError);
        return;
      }
      setIsTranscribing(true);
      setTranscribeError(null);
      try {
        const base64 = await blobToBase64(blob);
        const text = await transcribeAudio(base64, blob.type || 'audio/webm');
        setTranscript(text);
      } catch (err: any) {
        setTranscribeError(err?.message || t.transcriptionFailedError);
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
      setParseError(t.voiceEmptyTranscriptError);
      return;
    }
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseVoiceTranscript(transcript.trim());
      applyParseResult(result);
    } catch (err: any) {
      setParseError(err?.message || t.voiceParseError);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert(t.voiceInvalidAmountAlert);
      return;
    }
    if (!categoryId) {
      alert(t.voiceMissingCategoryAlert);
      return;
    }
    setIsSaving(true);
    try {
      await addExpense({
        title: description.trim() || t.voiceDefaultTitle,
        amount: parsedAmount,
        date,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        paymentMethod,
        notes: `${t.voiceNotesPrefix}"${transcript.trim()}"`,
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
            {t.voiceExpenseTitle}
          </h3>
          <button onClick={handleClose} className="text-[#627064] hover:text-[#1E2922]" aria-label={t.modalCloseAriaLabel}>
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
                  aria-label={isListening ? t.voiceLiveSpeechStopAria : t.voiceLiveSpeechStartAria}
                  title={t.voiceLiveSpeechTitle}
                >
                  {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#627064] font-bold text-center">
                  {isListening ? t.voiceListeningActiveLabel : t.voiceLiveSpeechLabel}
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
                  aria-label={audio.isRecording ? t.voiceRecordStopAria : t.voiceRecordStartAria}
                  title={t.voiceRecordTitle}
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
                    ? t.transcribingStatus
                    : audio.isRecording
                      ? t.recordingActiveLabel.replace('{time}', formatRecordTime(audio.recordingSeconds))
                      : t.recordAndTranscribeLabel}
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
                {t.voiceTranscriptLabel}
              </label>
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={t.voiceTranscriptPlaceholder}
                className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[t.voiceExampleGroceries, t.voiceExampleCoffee, t.voiceExampleToday].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setTranscript(example)}
                    className="text-[10px] font-mono px-2 py-1 rounded-full bg-[#EAE5DC] hover:bg-[#E2DDD3] border border-[#DCD5C8] text-[#354238] transition"
                  >
                    {t.tryExamplePrefix}“{example}”
                  </button>
                ))}
              </div>
              {!isSupported && (
                <p className="text-[11px] font-mono text-[#627064] mt-1.5">
                  {t.voiceNoSupportNotice}
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
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleParse}
                disabled={isParsing || !transcript.trim()}
                className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] disabled:opacity-50 text-amber-100 text-xs font-serif font-bold shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isParsing ? t.parsingStatus : t.parseExpenseBtn}
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
                    {t.clarificationHeardHint.replace('{transcript}', transcript.trim())}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  {t.amountLabel} ({currency})
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
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.date}</label>
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
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.categoryLabel}</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs text-[#1E2922] font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                >
                  <option value="">{t.selectCategoryOption}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {translateDataName(c.name, language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.subcategoryLabel}</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs text-[#1E2922] font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                >
                  <option value="">{t.noneOption}</option>
                  {activeCategory?.subcategories?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {translateDataName(s.name, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.voiceDescriptionLabel}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.voiceDescriptionPlaceholder}
                className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.heardTranscriptLabel}</label>
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
                ← {t.backBtn}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] disabled:opacity-50 text-amber-100 text-xs font-serif font-bold shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isSaving ? t.savingStatus : t.confirmAddExpenseBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
