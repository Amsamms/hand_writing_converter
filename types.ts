
export interface GeminiResponse {
  isTable: boolean;
  textContent: string;
  tableData?: string[][];
}
