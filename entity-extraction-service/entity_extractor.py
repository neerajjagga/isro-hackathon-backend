from fastapi import FastAPI, Request
import spacy
from spacy.pipeline import EntityRuler

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

ruler = nlp.add_pipe("entity_ruler", before="ner")
patterns = [
    {"label": "SATELLITE", "pattern": "INSAT-3D"},
    {"label": "SATELLITE", "pattern": "SCATSAT-1"},
    {"label": "INSTITUTION", "pattern": "ISRO"},
    {"label": "INSTITUTION", "pattern": "Space Applications Centre"},
    {"label": "LOCATION", "pattern": "Sriharikota"},
    {"label": "LAUNCH_VEHICLE", "pattern": "PSLV-C35"},
    {"label": "SENSOR", "pattern": "Ku-band Pencil Beam"},
    {"label": "PRODUCT", "pattern": "Ocean State Forecast"},
    {"label": "SERVICE", "pattern": "MOSDAC LIVE"},
    {"label": "INSTRUMENT", "pattern": "S-band transponders"},
]
ruler.add_patterns(patterns)

@app.post("/extract-entities")
async def extract_entities(request: Request):
    data = await request.json()
    text = data.get("text", "")
    doc = nlp(text)

    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_
        })
    
    return {"entities": entities}
