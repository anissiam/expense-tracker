import { en } from './en';
import { ar } from './ar';
import { Language, TranslationDictionary } from './types';

export const translations: Record<Language, TranslationDictionary> = { en, ar };

export { en, ar };
export type { Language, TranslationDictionary };
