export function math(a: any, b: any, operator: string) {
  a = Number(a);
  b = Number(b);
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b !== 0 ? a / b : 0;
    case 'min':
      return Math.min(a, b);
    case 'max':
      return Math.max(a, b);
    default:
      return 0;
  }
}
