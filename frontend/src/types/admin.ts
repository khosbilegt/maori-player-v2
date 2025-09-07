// Admin panel types and interfaces

export interface VideoFormData {
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  duration: number;
  category: string;
  tags: string[];
  language: string;
  difficulty_level: string;
  transcript_url?: string;
  subtitles_url?: string;
}

export interface VocabularyFormData {
  maori: string;
  english: string;
  pronunciation: string;
  description: string;
}

export interface AdminStats {
  totalVideos: number;
  totalVocabulary: number;
  recentVideos: number;
  recentVocabulary: number;
}

export interface AdminTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface AdminTableAction {
  label: string;
  action: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
}

export interface AdminFormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "multiselect" | "url";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}
