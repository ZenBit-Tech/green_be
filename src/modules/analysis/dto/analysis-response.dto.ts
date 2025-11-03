export class ResponseAnalysisDto {
  markers: {
    name: string;
    value: number | string;
    unit?: string;
    normalRange?: string;
    recommendation?: string;
  }[];
  userCommentResponse?: string;
  recommendations: {
    supplements?: string[];
    nutrition?: string[];
    drugs?: string[];
    exercise?: string[];
  };
  finalAssessment: {
    overallHealthStatus: string;
    recommendationSummary: string;
  };
}
