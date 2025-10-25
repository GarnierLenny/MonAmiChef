import React, { useState } from "react";
import { Send, X, Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { chatService } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";
import { WaveformVisualizer } from "@/components/ui/waveform-visualizer";

interface Tag {
  category: string;
  value: string | number;
  label: string;
  color: string;
}

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  isOverLimit?: boolean;
  maxCharacters?: number;
  placeholder?: string;
  canSend?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  tags?: Tag[];
  onRemoveTag?: (category: string, value: string | number) => void;
  onClearAllTags?: () => void;
  className?: string;
  helperText?: string; // Keep for backward compatibility with ChatPage
}

export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      inputValue,
      onInputChange,
      onSubmit,
      isGenerating,
      isOverLimit = false,
      maxCharacters,
      placeholder = "Tell me what you crave",
      canSend = true,
      inputRef,
      tags = [],
      onRemoveTag,
      onClearAllTags,
      className,
      helperText,
    },
    ref,
  ) => {
    const { toast } = useToast();
    const [isTranscribing, setIsTranscribing] = useState(false);
    const {
      isRecording,
      recordingTime,
      audioLevel,
      startRecording,
      stopRecording,
      error: recordingError,
    } = useAudioRecorder();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isGenerating || !canSend) return;
      onSubmit(e);
    };

    const handleMicrophoneClick = async () => {
      if (isRecording) {
        // Stop recording and transcribe
        try {
          setIsTranscribing(true);
          const audioBlob = await stopRecording();

          if (!audioBlob) {
            toast({
              title: "Recording failed",
              description: "No audio was recorded. Please try again.",
              variant: "destructive",
            });
            return;
          }

          // Transcribe audio
          const transcribedText = await chatService.transcribeAudio(audioBlob);

          if (transcribedText) {
            onInputChange(transcribedText);
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Transcription failed",
            description: error instanceof Error ? error.message : "Failed to transcribe audio. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsTranscribing(false);
        }
      } else {
        // Start recording
        try {
          await startRecording();
        } catch (error) {
          console.error('Recording start error:', error);
        }
      }
    };

    // Show recording error toast
    React.useEffect(() => {
      if (recordingError) {
        toast({
          title: "Microphone error",
          description: recordingError,
          variant: "destructive",
        });
      }
    }, [recordingError, toast]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0",
          !className?.includes("meal-plan-input") && !className?.includes("no-container") && "chat-input-container bg-orange-50",
          className?.includes("no-container") && "",
        )}
      >
        <div className={cn(!className?.includes("meal-plan-input") && "px-4 pb-4")}>
          {/* Enhanced Input Form */}
          <form
            onSubmit={handleSubmit}
            className={cn(
              "flex items-center gap-1 p-0.5 pl-5 bg-white flex-1 border rounded-full",
              "transition-all duration-300",
              isOverLimit
                ? "border-red-300 bg-red-50 shadow-lg shadow-red-200/50 focus-within:shadow-xl focus-within:shadow-red-300/50 focus-within:ring-2 focus-within:ring-red-400"
                : isRecording
                ? "border-red-300 shadow-lg shadow-red-200/50 ring-2 ring-red-300 animate-pulse"
                : "border-orange-200/50 shadow-lg shadow-orange-500/15 hover:shadow-xl hover:shadow-orange-500/20 focus-within:shadow-xl focus-within:shadow-orange-500/25 focus-within:ring-2 focus-within:ring-orange-400",
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={isRecording ? `Recording... ${recordingTime}s` : placeholder}
              maxLength={maxCharacters}
              disabled={isGenerating || isRecording || isTranscribing}
              className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0 placeholder:text-gray-400 text-gray-900"
            />

            {/* Waveform Visualizer - shown when recording */}
            {isRecording && (
              <div className="flex items-center gap-2 mr-2">
                <WaveformVisualizer color="orange" barCount={4} audioLevel={audioLevel} />
              </div>
            )}

            {/* Microphone Button */}
            <Button
              type="button"
              onClick={handleMicrophoneClick}
              disabled={isGenerating || isTranscribing}
              variant={isRecording ? "default" : "ghost"}
              size="icon"
              className={cn(
                "shrink-0 rounded-full h-9 w-9 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isRecording
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/30 animate-pulse text-white"
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50",
                isTranscribing && "text-orange-600",
              )}
            >
              {isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRecording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!canSend || isGenerating || isOverLimit || isRecording || isTranscribing}
              size="icon"
              className={cn(
                "shrink-0 rounded-full h-10 w-10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isOverLimit
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/30",
              )}
            >
              <Send
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  canSend &&
                    !isGenerating &&
                    "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                )}
              />
            </Button>
          </form>

          {/* Helper Text */}
          {helperText && (
            <p className="text-xs text-gray-500 mt-1.5 px-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";
