import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsAfter(otherProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [otherProperty],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [prop] = args.constraints as [string];
          const other = (args.object as Record<string, unknown>)[prop];
          if (value == null || other == null) return true; // defer to other validators for required
          const toDate = (u: unknown): Date | null => {
            if (u instanceof Date) return Number.isNaN(u.getTime()) ? null : u;
            if (typeof u === 'string' || typeof u === 'number') {
              const d = new Date(u);
              return Number.isNaN(d.getTime()) ? null : d;
            }
            return null;
          };
          const d1 = toDate(value);
          const d0 = toDate(other);
          if (!d1 || !d0) return true; // let other validators complain about invalid dates
          return d1.getTime() > d0.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          const [prop] = args.constraints as [string];
          return `${args.property} must be after ${prop}`;
        },
      },
    });
  };
}
