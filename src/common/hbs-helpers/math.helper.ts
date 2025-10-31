export function math(a: number | string, b: number | string, operator: string): number {
  const aNum = Number(a);
  const bNum = Number(b);
  switch (operator) {
    case '+':
      return aNum + bNum;
    case '-':
      return aNum - bNum;
    case '*':
      return aNum * bNum;
    case '/':
      return bNum !== 0 ? aNum / bNum : 0;
    case 'min':
      return Math.min(aNum, bNum);
    case 'max':
      return Math.max(aNum, bNum);
    default:
      return 0;
  }
}
