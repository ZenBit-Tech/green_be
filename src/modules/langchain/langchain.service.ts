/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JsonOutputParser,
  StringOutputParser,
} from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { LANGCHAIN_ERROR_MESSAGES } from '@/common/constants/langchain.constants.';
import { ResponseAnalysisDto } from '@/modules/analysis/dto/analysis-response.dto';
import { RequestAnalysisDto } from '@/modules/analysis/dto/analysis-request.dto';
import { MedicalDataCheck } from '@/modules/upload/upload.service';
import { BLOOD_MARKER_ANALYSIS_PROMPT } from './prompts/blood-marker.prompt';
import { CHECK_MARKER_ANALYSIS_PROMPT } from './prompts/check-marker.prompt';
import { FULL_BLOOD_ANALYSIS_PROMPT } from './prompts/full-analysis.prompt';

@Injectable()
export class LangChainService {
  private readonly llm: ChatGoogleGenerativeAI;
  private readonly outputParser: StringOutputParser;
  private readonly logger = new Logger(LangChainService.name);

  constructor(private readonly configService: ConfigService) {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!geminiApiKey) {
      this.logger.error(LANGCHAIN_ERROR_MESSAGES.MISSING_API_KEY);
      throw new Error(LANGCHAIN_ERROR_MESSAGES.MISSING_API_KEY);
    }

    try {
      this.llm = new ChatGoogleGenerativeAI({
        apiKey: geminiApiKey,
        model: 'gemini-2.5-flash-lite',
        temperature: 0.1,
        maxOutputTokens: 30000,
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

  async checkBloodMarkers(text: string): Promise<MedicalDataCheck> {
    const parser = new JsonOutputParser<MedicalDataCheck>();

    const chain = CHECK_MARKER_ANALYSIS_PROMPT.pipe(this.llm).pipe(parser);

    const result = await chain.invoke({
      text,
    });

    return result;
  }

  async analyzeBloodMarkers(text: string): Promise<RequestAnalysisDto> {
    const parser = new JsonOutputParser<RequestAnalysisDto>();

    const chain = BLOOD_MARKER_ANALYSIS_PROMPT.pipe(this.llm).pipe(parser);

    const result = await chain.invoke({
      text,
    });

    return result;
  }

  async generateFullAnalysis(
    payload: RequestAnalysisDto,
  ): Promise<ResponseAnalysisDto> {
    const { age, gender, markers, comment, selectedOptions } = payload;

    const parser = new JsonOutputParser<ResponseAnalysisDto>();

    const chain = FULL_BLOOD_ANALYSIS_PROMPT.pipe(this.llm).pipe(parser);
    return await chain.invoke({
      age,
      gender,
      markers: markers,
      comment: comment || LANGCHAIN_ERROR_MESSAGES.NO_TEXT_PROVIDED,
      options: selectedOptions || LANGCHAIN_ERROR_MESSAGES.NO_OPTIONS_SELECTED,
    });
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