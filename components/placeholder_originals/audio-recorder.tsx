import { useState, useRef } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TrackableFile } from "@/lib/interfaces";
import { useTranslation } from 'react-i18next';

interface AudioRecorderProps {
  files: TrackableFile[];
  setFiles?: (files: TrackableFile[]) => void;
  onAddFiles?: (files: TrackableFile[]) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  buttonStartLabel?: string;
  buttonStopLabel?: string;
  errorMessage?: string;
}

export default function AudioRecorder({ 
  files = [],
  setFiles,
  onAddFiles,
  isSubmitting,
  placeholder = "Enter name",
  buttonStartLabel = "Start Recording",
  buttonStopLabel = "Stop Recording",
  errorMessage = "Unable to access microphone"
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [label, setLabel] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { t } = useTranslation('ui');

  const startRecording = async () => {
    if (!label.trim()) {
      toast.warning(t('pleaseEnterVoiceName'));
      return;
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
  
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setPreviewUrl(url);
        
        if (label.trim()) {
          const file = new File([audioBlob], `${label}.wav`, { type: 'audio/wav' });
          const newFile = {
            id: undefined,
            fileObject: file,
          };
  
          if (setFiles) {
            setFiles([...files, newFile]);
          }
          
          if (onAddFiles) {
            onAddFiles([newFile]);
          }
  
          setLabel('');
        }
  
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      };
  
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error(errorMessage);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-x-2">
          <label className="text-sm font-medium text-foreground">
            {t('name')}
          </label>
          <Input
            className="w-72"
            placeholder={placeholder}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isRecording || isSubmitting}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSubmitting}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                {buttonStopLabel}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {buttonStartLabel}
              </>
            )}
          </Button>

          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
      <audio controls src={previewUrl} className="w-72" />
    </div>
  );
} 