export type DocGenConfig = {
    includes: string[];
    describeFunctionNameOverride?: string;
    testFunctionNameOverride?: string;
    testSuffixToRemove?: string;
    outputDirectory?: string;
    templateDirectory?: string;
    excludes?: string[];
    additionalFileExtensions?: string[];
};
