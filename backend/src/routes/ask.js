import { Router } from "express";
import { loadNLP } from "../utils/nlpManager.js";
import { generateAnswer } from "../utils/generateAnswer.js";
import { semanticSearch } from "../utils/semanticSearch.js";

const askRouter = Router();

askRouter.post("/", async (req, res) => {
    console.log("Here");
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    try {
        const manager = await loadNLP();
        const result = await manager.process("en", query);

        const intent = result.intent;
        const confidence = result.score;
        const entities = result.entities.map((ent) => ent.option || ent.utteranceText);
        const searchTerms = entities.join(" ") || query;

        const topDocs = await semanticSearch(searchTerms, 3); // fetch top 3 docs
        console.log(topDocs);

        if (!topDocs.length) {
            return res.json({
                intent,
                confidence,
                entities,
                answer: "Sorry, I couldn’t find any relevant information.",
            });
        }

        const answer = await generateAnswer(query);
        console.log(answer);

        res.json({
            intent,
            confidence,
            entities,
            answer,
            sources: topDocs.map(doc => ({ id: doc.id, score: doc.score })),
        });

    } catch (err) {
        console.error("Ask route error:", err);
        res.status(500).json({ error: "Failed to generate answer." });
    }
});

export default askRouter;
