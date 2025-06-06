import { TrackableFile } from "./interfaces";

export type PDFFile = string | File | null;

export type DirectionOptions = "rtl" | "ltr" | undefined;

export type FilesDragNDropProps = {
  files: TrackableFile[];
  addFiles: (files: TrackableFile[]) => void;
  removeFiles: (files: TrackableFile[]) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
  acceptFiles?: Record<string, string[]>;
  children?: React.ReactNode;
  disabled?: boolean;
};