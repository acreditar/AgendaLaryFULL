import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
    it('merges class names and resolves tailwind conflicts', () => {
        const flag = Math.random() < 0 ? 'hidden' : undefined; // force a non-constant expression
        const res = cn('p-2', 'text-sm', 'p-4', flag, undefined);
        // tailwind-merge should keep the latter padding (p-4)
        expect(res).toContain('p-4');
        expect(res).not.toContain('p-2');
        expect(res).toContain('text-sm');
    });
});
