export function extractFAQs(fullText) {
    const faqBlocks = [];

    // Regex to split at typical FAQ-style questions (start with 'How', 'What', etc.)
    const qnaRegex = /(What|How|Why|When|Where|Which|Can|Is|I)\b[^\n?]{5,100}?\?/g;

    const indices = [];
    let match;
    while ((match = qnaRegex.exec(fullText)) !== null) {
        indices.push(match.index);
    }

    for (let i = 0; i < indices.length; i++) {
        const start = indices[i];
        const end = indices[i + 1] || fullText.length;
        const chunk = fullText.slice(start, end).trim();

        const splitIndex = chunk.indexOf('?');
        if (splitIndex !== -1) {
            const question = chunk.slice(0, splitIndex + 1).trim();
            const answer = chunk.slice(splitIndex + 1).trim();
            if (question.length > 10 && answer.length > 10) {
                faqBlocks.push({ question, answer });
            }
        }
    }

    return faqBlocks;
}
