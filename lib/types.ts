import { TrackableFile } from "./interfaces";

import ButtonMeta from '@/components/display-components/buttons/Button/Button.meta.json';

export type ComponentMetadata = typeof ButtonMeta;

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