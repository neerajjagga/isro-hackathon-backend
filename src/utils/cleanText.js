export const cleanText = (str) => {
  return str
    .replace(/<[^>]*>/g, '')              // remove HTML tags
    .replace(/\r?\n|\r/g, ' ')            // replace line breaks with space
    .replace(/\t/g, ' ')                  // replace tabs with space
    .replace(/[^\w\s.,:;?()/-]/g, '')     // keep alphanum + common punctuation
    .replace(/\s+/g, ' ')                 // collapse multiple spaces
    .trim();
};
