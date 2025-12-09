export enum Language {
  ENGLISH = 'English',
  CHINESE = 'Chinese (Simplified)',
}

export interface TranslationState {
  isTranslating: boolean;
  error: string | null;
}

export type EditorMode = 'editor' | 'preview';