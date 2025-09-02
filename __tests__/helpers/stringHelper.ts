export function normalizeIndent (str: string) {
  return str
    .replace(/\t/g, '  ')         
    .split('\n')                       
    .map(line => line.trim())          
    .filter(line => line.length > 0)   
    .join('\n')                        
    .trim();      
}