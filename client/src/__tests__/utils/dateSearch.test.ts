import { isDateLikeSearch, matchesDateSearch, formatDateForSearch } from '@/utils/dateSearch';

describe('dateSearch utilities', () => {
  describe('isDateLikeSearch', () => {
    it('should identify single digit day/month', () => {
      expect(isDateLikeSearch('03')).toBe(true);
      expect(isDateLikeSearch('1')).toBe(true);
      expect(isDateLikeSearch('25')).toBe(true);
    });

    it('should identify year', () => {
      expect(isDateLikeSearch('1986')).toBe(true);
      expect(isDateLikeSearch('2025')).toBe(true);
    });

    it('should identify day.month format', () => {
      expect(isDateLikeSearch('03.01')).toBe(true);
      expect(isDateLikeSearch('25.12')).toBe(true);
    });

    it('should identify month.year format', () => {
      expect(isDateLikeSearch('01.1986')).toBe(true);
      expect(isDateLikeSearch('12.2025')).toBe(true);
    });

    it('should identify full date format', () => {
      expect(isDateLikeSearch('03.01.1986')).toBe(true);
      expect(isDateLikeSearch('25.12.2025')).toBe(true);
    });

    it('should reject non-date strings', () => {
      expect(isDateLikeSearch('abc')).toBe(false);
      expect(isDateLikeSearch('12345')).toBe(false);
      expect(isDateLikeSearch('03.01.1986.extra')).toBe(false);
    });
  });

  describe('matchesDateSearch', () => {
    const testDate = new Date('1986-01-03');

    it('should match full date', () => {
      expect(matchesDateSearch(testDate, '03.01.1986')).toBe(true);
    });

    it('should match day.month', () => {
      expect(matchesDateSearch(testDate, '03.01')).toBe(true);
    });

    it('should match month.year', () => {
      expect(matchesDateSearch(testDate, '01.1986')).toBe(true);
    });

    it('should match year', () => {
      expect(matchesDateSearch(testDate, '1986')).toBe(true);
    });

    it('should match day', () => {
      expect(matchesDateSearch(testDate, '03')).toBe(true);
    });

    it('should match month', () => {
      expect(matchesDateSearch(testDate, '01')).toBe(true);
    });

    it('should not match incorrect dates', () => {
      expect(matchesDateSearch(testDate, '04.01.1986')).toBe(false);
      expect(matchesDateSearch(testDate, '03.02.1986')).toBe(false);
      expect(matchesDateSearch(testDate, '1987')).toBe(false);
    });
  });

  describe('formatDateForSearch', () => {
    it('should format date correctly', () => {
      const date = new Date('1986-01-03');
      expect(formatDateForSearch(date)).toBe('03.01.1986');
    });

    it('should handle single digit day and month', () => {
      const date = new Date('1986-01-03');
      expect(formatDateForSearch(date)).toBe('03.01.1986');
    });
  });
});
