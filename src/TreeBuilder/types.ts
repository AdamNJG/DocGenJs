export interface UseCase {
  name: string;         
  codeExample: string;   
}

export interface Feature {
  name: string;         
  useCases: UseCase[];  
}

export interface Page {
  name: string;        
  features: Feature[];  
}

export interface InstructionTree {
  pages: Page[];
}