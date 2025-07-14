export const cleanText = (str) => {
  return str
    .replace(/<[^>]*>/g, '')              
    .replace(/\r?\n|\r/g, ' ')            
    .replace(/\t/g, ' ')                 
    .replace(/[^\w\s.,:;?()/-]/g, '')     
    .replace(/\s+/g, ' ')              
    .trim();
};
