declare module "kotowaza" {
  export interface KotowazaEntry {
    id: string;
    japanese: string;
    reading: string;
    romaji: string;
    literal: string;
    meaning: {
      id: string;
      en: string;
    };
    tags: string[];
    tags_id?: string[];
    jlpt?: string;
    equivalent?: {
      id?: string;
      en?: string;
    };
    examples: Array<{
      ja: string;
      romaji: string;
      id: string;
      en?: string;
    }>;
    related: string[];
  }

  export interface KotowazaApi {
    all(): KotowazaEntry[];
    get(id: string): KotowazaEntry | null;
    search(query: string): KotowazaEntry[];
    byTag(tag: string): KotowazaEntry[];
    byTagId(tag: string): KotowazaEntry[];
    byJlpt(level: string): KotowazaEntry[];
    random(): KotowazaEntry;
    count(): number;
    tags(): string[];
    tagsId(): string[];
    jlptLevels(): string[];
    url(id: string): string;
  }

  const kotowaza: KotowazaApi;

  export default kotowaza;
}
