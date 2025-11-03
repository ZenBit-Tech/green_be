import { PromptTemplate } from '@langchain/core/prompts';

export const CHECK_MARKER_ANALYSIS_PROMPT = PromptTemplate.fromTemplate(`
You are an expert data classifier. 
Your task is to analyze the given text and determine if it contains medical data or laboratory results.

Your goals:
1. Return structured data in valid JSON.

Text:
{text}

JSON output format (strictly follow this structure):
{{
  "isMedical": boolean, 
  "hasBloodMarkers": boolean, 
}}

Rules:
- Respond ONLY with valid JSON (no markdown, no commentary).
- If no blood markers are found, set "hasBloodMarkers": false.
- Do not hallucinate missing data; only use what exists in the text.
`);
