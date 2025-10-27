/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { LANGCHAIN_ERROR_MESSAGES } from '@/common/constants/langchain.constants.';

const { StringOutputParser } = require('@langchain/core/output_parsers');
const { PromptTemplate } = require('@langchain/core/prompts');

@Injectable()
export class LangChainService {
  private readonly llm: ChatOpenAI;
  private readonly outputParser: any;
  private readonly logger = new Logger(LangChainService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error(LANGCHAIN_ERROR_MESSAGES.MISSING_API_KEY);
      throw new Error(LANGCHAIN_ERROR_MESSAGES.MISSING_API_KEY);
    }

    try {
      this.llm = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: 'gpt-4',
        temperature: 0.1,
        timeout: 30000,
      });
      this.outputParser = new StringOutputParser();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`LangChain init failed: ${error.message}`);
      } else {
        throw new Error(LANGCHAIN_ERROR_MESSAGES.INIT_FAILED_UNKNOWN);
      }
    }
  }

  async analyzeBloodMarkers(text: string): Promise<string> {
    try {
      if (!text?.trim()) {
        return LANGCHAIN_ERROR_MESSAGES.NO_TEXT_PROVIDED;
      }

      const prompt = PromptTemplate.fromTemplate(`
        Analyze the following medical text and determine if it contains information about blood markers.
        Focus on identifying mentions of common blood tests like:
        - Complete Blood Count (CBC) components
        - Lipid panel (cholesterol, triglycerides)
        - Liver function tests (ALT, AST, ALP)
        - Kidney function tests (creatinine, BUN)
        - Thyroid markers (TSH, T3, T4)
        - Blood glucose and HbA1c
        - Inflammatory markers (CRP, ESR)
        - Vitamin levels
        - Electrolytes
        - Any other blood-based biomarkers

        Text to analyze:
        {text}

        Please provide a concise response indicating:
        1. Whether blood marker information is present (YES/NO)
        2. A brief summary of what blood markers were mentioned
        3. Any notable values or ranges if provided

        Format your response clearly.
      `);

      const chain = prompt.pipe(this.llm).pipe(this.outputParser);

      const result: any = await chain.invoke({ text });
      return String(result);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error('Error analyzing blood markers', err.stack);
      return LANGCHAIN_ERROR_MESSAGES.ANALYZE_FAILED;
    }
  }

  async customQuery(text: string, query: string): Promise<string> {
    try {
      if (!text?.trim()) {
        return LANGCHAIN_ERROR_MESSAGES.NO_TEXT_FOR_QUERY;
      }

      if (!query?.trim()) {
        return LANGCHAIN_ERROR_MESSAGES.NO_QUERY_PROVIDED;
      }

      const prompt = PromptTemplate.fromTemplate(`
        Based on the following text, answer this question: {query}
        
        Text: {text}
        
        Please provide a clear, concise answer based only on the information in the text.
        If the text doesn't contain relevant information, state that clearly.
      `);

      const chain = prompt.pipe(this.llm).pipe(this.outputParser);

      const result: any = await chain.invoke({ text, query });
      return String(result);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error('Error processing custom query', err.stack);
      return LANGCHAIN_ERROR_MESSAGES.CUSTOM_QUERY_FAILED;
    }
  }
}
