export const mapLanguageToJudge0Id = (language: string): number => {
  switch (language.toLowerCase()) {
    case 'c++':
    case 'cpp':
      return 54;
    case 'python':
    case 'py':
      return 71;
    case 'javaScript':
    case 'js':
      return 63;
    case 'java':
      return 62;
    case 'rust':
    case 'rs':
      return 73;
    default:
      throw new Error('Invalid language');
  }
};
