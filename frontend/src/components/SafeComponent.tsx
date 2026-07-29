// utils/contentFilter.ts

const blockedWords = ["sex","erotic","porn","nude","nudity","adult","fetish","xxx","desire","seduction","escort","lust","intimate","sensual","orgy","playboy",];

export const isFamilySafe = (item: any) => {
  const title = (item.title || item.name || "").toLowerCase();
  const overview = (item.overview || "").toLowerCase();

  const containsBlockedWord =blockedWords.some(
    word =>
        title.includes(word) ||
        overview.includes(word)
    );

  return (
    !item.adult &&
    !containsBlockedWord
  );
};