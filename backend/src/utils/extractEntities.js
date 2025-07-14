import axios from 'axios';

export const extractEntities = async (text) => {
    try {
        const response = await axios.post('http://localhost:5005/extract-entities', { text });
        const rawEntities = response.data.entities;

        const corrected = correctEntityLabels(rawEntities);
        return corrected;
    } catch (error) {
        console.error('Error extracting entities:', error.message);
        return [];
    }
};

function correctEntityLabels(entities) {
    return entities.map((ent) => {
        const lowerText = ent.text.toLowerCase();

        // Handle login/reset/password actions
        if (
            lowerText.includes("forgot password") ||
            lowerText.includes("reset password") ||
            lowerText.includes("login") ||
            lowerText.includes("sign in") ||
            lowerText.includes("hyperlink")
        ) {
            return { ...ent, label: "ACTION" };
        }

        // Handle satellite and organization names
        if (
            lowerText.includes("isro") ||
            lowerText.includes("mosdac") ||
            lowerText.includes("nrsc")
        ) {
            return { ...ent, label: "ORG" };
        }

        // Satellites (you can keep adding more known ones)
        if (
            /insat|ocean|resourcesat|scatsat|cartosat|meghatropiques/.test(lowerText)
        ) {
            return { ...ent, label: "SATELLITE" };
        }

        return ent; // Keep original if no rule matched
    });
}
