declare module '*/dictionary.json' {
  interface DictionaryItem {
    id: number;
    title: string;
    summary: string;
    slug: string;
  }

  const dictionary: DictionaryItem[];
  export default dictionary;
} 