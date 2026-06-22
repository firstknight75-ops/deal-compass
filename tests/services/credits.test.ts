import { describe, it, expect } from 'vitest';
import { creditsService } from '../../src/services/credits.service';

describe('CreditsService', () => {
  it('should have spendCredits method', () => {
    expect(typeof creditsService.spendCredits).toBe('function');
  });

  it('should have addCredits method', () => {
    expect(typeof creditsService.addCredits).toBe('function');
  });
});
