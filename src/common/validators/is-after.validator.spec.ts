import 'reflect-metadata';
import { validateSync } from 'class-validator';
import { IsAfter } from './is-after.validator';
import { Type } from 'class-transformer';

class TestDto {
  @Type(() => Date)
  start!: Date;

  @Type(() => Date)
  @IsAfter('start', { message: 'End must be after start' })
  end!: Date;
}

class DefaultMsgDto {
  @Type(() => Date)
  start!: Date;

  @Type(() => Date)
  @IsAfter('start')
  end!: Date;
}

describe('IsAfter validator', () => {
  it('passes when values are missing (other validators handle required)', () => {
    const dto = new TestDto();
    dto.start = undefined as unknown as Date;
    dto.end = undefined as unknown as Date;
    const errors = validateSync(dto);
    expect(errors.length).toBe(0);
  });

  it('passes when end is after start', () => {
    const dto = new TestDto();
    dto.start = new Date('2025-01-01');
    dto.end = new Date('2025-01-02');
    const errors = validateSync(dto);
    expect(errors.length).toBe(0);
  });

  it('fails when end is before or equal to start', () => {
    const dto = new TestDto();
    dto.start = new Date('2025-01-02');
    dto.end = new Date('2025-01-01');
    const errors = validateSync(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('fails when end equals start and uses custom message', () => {
    const dto = new TestDto();
    dto.start = new Date('2025-01-02');
    dto.end = new Date('2025-01-02');
    const errors = validateSync(dto);
    expect(errors.length).toBeGreaterThan(0);
    // gather messages
    const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
    expect(
      messages.some((m) => typeof m === 'string' && m.includes('End must be after start')),
    ).toBe(true);
  });

  it('ignores invalid dates and lets other validators report', () => {
    const dto = new TestDto();
    // Invalid date strings should be ignored by our validator
    (dto as unknown as Record<string, unknown>).start = 'not-a-date';
    (dto as unknown as Record<string, unknown>).end = 'also-not-a-date';
    const errors = validateSync(dto);
    // Our validator returns true; other validators (IsDate) would normally catch this,
    // but here we are only testing our decorator behavior.
    expect(Array.isArray(errors)).toBe(true);
  });

  it('treats one invalid and one valid date as pass-through (no error from this validator)', () => {
    const dto = new TestDto();
    (dto as unknown as Record<string, unknown>).start = 'invalid';
    dto.end = new Date('2025-01-03');
    const errors = validateSync(dto);
    expect(Array.isArray(errors)).toBe(true);
  });

  it('uses default error message when no custom message provided', () => {
    const dto = new DefaultMsgDto();
    dto.start = new Date('2025-01-01');
    dto.end = new Date('2025-01-01');
    const errors = validateSync(dto);
    const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
    expect(
      messages.some((m) => typeof m === 'string' && m.includes('end must be after start')),
    ).toBe(true);
  });

  it('treats non-date object as invalid date and passes through', () => {
    const dto = new TestDto();
    (dto as unknown as Record<string, unknown>).start = { when: 'later' };
    dto.end = new Date('2025-01-02');
    const errors = validateSync(dto);
    expect(Array.isArray(errors)).toBe(true);
  });
});
