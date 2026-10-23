// Offline gallery copy; checked against the first-party package.
import type { Widget } from '@shiftpane/format'
export const githubContributions: Widget = {
  id: 'github-contributions',
  name: 'GitHub contributions',
  summary: 'Big green contribution squares, with a full-year overview on large.',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['dev'],
  icon: 'activity',
  tone: 'dark',
  featured: true,
  minAppVersion: '0.6.0',
  sizes: ['small', 'medium', 'large'],
  refreshSeconds: 1800,
  createdAt: '2026-10-23',
  versions: [
    {
      version: '1.0.0',
      publishedAt: '2026-10-23',
      permissions: {
        sources: [],
        actions: [],
        local: [],
        network: ['api.github.com'],
        secrets: ['GITHUB_TOKEN'],
      },
      notes:
        'First release: large contribution squares on small and medium, full-year detail on large.',
    },
  ],
  permissions: {
    sources: [],
    actions: [],
    local: [],
    network: ['api.github.com'],
    secrets: ['GITHUB_TOKEN'],
  },
  config: [
    {
      key: 'username',
      label: 'GitHub username',
      type: 'string',
      required: true,
      help: 'A GitHub.com user, not an organization. Add GITHUB_TOKEN in Secrets.',
    },
  ],
  view: {
    small: {
      type: 'contribution-calendar',
      bind: '/calendar',
      weeks: 8,
      boxesOnly: true,
    },
    medium: {
      type: 'contribution-calendar',
      bind: '/calendar',
      weeks: 12,
      boxesOnly: true,
    },
    large: {
      type: 'stack',
      gap: 1.5,
      children: [
        {
          type: 'text',
          text: '@{/username}',
          size: 'sm',
        },
        {
          type: 'contribution-calendar',
          bind: '/calendar',
          weeks: 54,
          split: true,
        },
      ],
    },
  },
  sample: {
    username: 'octocat',
    calendar: {
      startDate: '2025-10-23',
      endDate: '2026-10-23',
      days: [
        {
          date: '2025-10-23',
          count: 0,
          level: 0,
        },
        {
          date: '2025-10-24',
          count: 0,
          level: 0,
        },
        {
          date: '2025-10-25',
          count: 5,
          level: 1,
        },
        {
          date: '2025-10-26',
          count: 3,
          level: 1,
        },
        {
          date: '2025-10-27',
          count: 4,
          level: 1,
        },
        {
          date: '2025-10-28',
          count: 0,
          level: 0,
        },
        {
          date: '2025-10-29',
          count: 13,
          level: 4,
        },
        {
          date: '2025-10-30',
          count: 14,
          level: 4,
        },
        {
          date: '2025-10-31',
          count: 12,
          level: 4,
        },
        {
          date: '2025-11-01',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-02',
          count: 9,
          level: 3,
        },
        {
          date: '2025-11-03',
          count: 10,
          level: 3,
        },
        {
          date: '2025-11-04',
          count: 11,
          level: 3,
        },
        {
          date: '2025-11-05',
          count: 3,
          level: 1,
        },
        {
          date: '2025-11-06',
          count: 4,
          level: 1,
        },
        {
          date: '2025-11-07',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-08',
          count: 13,
          level: 4,
        },
        {
          date: '2025-11-09',
          count: 14,
          level: 4,
        },
        {
          date: '2025-11-10',
          count: 12,
          level: 4,
        },
        {
          date: '2025-11-11',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-12',
          count: 9,
          level: 3,
        },
        {
          date: '2025-11-13',
          count: 10,
          level: 3,
        },
        {
          date: '2025-11-14',
          count: 11,
          level: 3,
        },
        {
          date: '2025-11-15',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-16',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-17',
          count: 6,
          level: 2,
        },
        {
          date: '2025-11-18',
          count: 13,
          level: 4,
        },
        {
          date: '2025-11-19',
          count: 14,
          level: 4,
        },
        {
          date: '2025-11-20',
          count: 12,
          level: 4,
        },
        {
          date: '2025-11-21',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-22',
          count: 9,
          level: 3,
        },
        {
          date: '2025-11-23',
          count: 10,
          level: 3,
        },
        {
          date: '2025-11-24',
          count: 11,
          level: 3,
        },
        {
          date: '2025-11-25',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-26',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-27',
          count: 6,
          level: 2,
        },
        {
          date: '2025-11-28',
          count: 7,
          level: 2,
        },
        {
          date: '2025-11-29',
          count: 0,
          level: 0,
        },
        {
          date: '2025-11-30',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-01',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-02',
          count: 9,
          level: 3,
        },
        {
          date: '2025-12-03',
          count: 10,
          level: 3,
        },
        {
          date: '2025-12-04',
          count: 11,
          level: 3,
        },
        {
          date: '2025-12-05',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-06',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-07',
          count: 6,
          level: 2,
        },
        {
          date: '2025-12-08',
          count: 7,
          level: 2,
        },
        {
          date: '2025-12-09',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-10',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-11',
          count: 5,
          level: 1,
        },
        {
          date: '2025-12-12',
          count: 3,
          level: 1,
        },
        {
          date: '2025-12-13',
          count: 4,
          level: 1,
        },
        {
          date: '2025-12-14',
          count: 11,
          level: 3,
        },
        {
          date: '2025-12-15',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-16',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-17',
          count: 6,
          level: 2,
        },
        {
          date: '2025-12-18',
          count: 7,
          level: 2,
        },
        {
          date: '2025-12-19',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-20',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-21',
          count: 5,
          level: 1,
        },
        {
          date: '2025-12-22',
          count: 3,
          level: 1,
        },
        {
          date: '2025-12-23',
          count: 4,
          level: 1,
        },
        {
          date: '2025-12-24',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-25',
          count: 13,
          level: 4,
        },
        {
          date: '2025-12-26',
          count: 14,
          level: 4,
        },
        {
          date: '2025-12-27',
          count: 6,
          level: 2,
        },
        {
          date: '2025-12-28',
          count: 7,
          level: 2,
        },
        {
          date: '2025-12-29',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-30',
          count: 0,
          level: 0,
        },
        {
          date: '2025-12-31',
          count: 5,
          level: 1,
        },
        {
          date: '2026-01-01',
          count: 3,
          level: 1,
        },
        {
          date: '2026-01-02',
          count: 4,
          level: 1,
        },
        {
          date: '2026-01-03',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-04',
          count: 13,
          level: 4,
        },
        {
          date: '2026-01-05',
          count: 14,
          level: 4,
        },
        {
          date: '2026-01-06',
          count: 12,
          level: 4,
        },
        {
          date: '2026-01-07',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-08',
          count: 9,
          level: 3,
        },
        {
          date: '2026-01-09',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-10',
          count: 5,
          level: 1,
        },
        {
          date: '2026-01-11',
          count: 3,
          level: 1,
        },
        {
          date: '2026-01-12',
          count: 4,
          level: 1,
        },
        {
          date: '2026-01-13',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-14',
          count: 13,
          level: 4,
        },
        {
          date: '2026-01-15',
          count: 14,
          level: 4,
        },
        {
          date: '2026-01-16',
          count: 12,
          level: 4,
        },
        {
          date: '2026-01-17',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-18',
          count: 9,
          level: 3,
        },
        {
          date: '2026-01-19',
          count: 10,
          level: 3,
        },
        {
          date: '2026-01-20',
          count: 11,
          level: 3,
        },
        {
          date: '2026-01-21',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-22',
          count: 4,
          level: 1,
        },
        {
          date: '2026-01-23',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-24',
          count: 13,
          level: 4,
        },
        {
          date: '2026-01-25',
          count: 14,
          level: 4,
        },
        {
          date: '2026-01-26',
          count: 12,
          level: 4,
        },
        {
          date: '2026-01-27',
          count: 0,
          level: 0,
        },
        {
          date: '2026-01-28',
          count: 9,
          level: 3,
        },
        {
          date: '2026-01-29',
          count: 10,
          level: 3,
        },
        {
          date: '2026-01-30',
          count: 11,
          level: 3,
        },
        {
          date: '2026-01-31',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-01',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-02',
          count: 6,
          level: 2,
        },
        {
          date: '2026-02-03',
          count: 7,
          level: 2,
        },
        {
          date: '2026-02-04',
          count: 14,
          level: 4,
        },
        {
          date: '2026-02-05',
          count: 12,
          level: 4,
        },
        {
          date: '2026-02-06',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-07',
          count: 9,
          level: 3,
        },
        {
          date: '2026-02-08',
          count: 10,
          level: 3,
        },
        {
          date: '2026-02-09',
          count: 11,
          level: 3,
        },
        {
          date: '2026-02-10',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-11',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-12',
          count: 6,
          level: 2,
        },
        {
          date: '2026-02-13',
          count: 7,
          level: 2,
        },
        {
          date: '2026-02-14',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-15',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-16',
          count: 5,
          level: 1,
        },
        {
          date: '2026-02-17',
          count: 9,
          level: 3,
        },
        {
          date: '2026-02-18',
          count: 10,
          level: 3,
        },
        {
          date: '2026-02-19',
          count: 11,
          level: 3,
        },
        {
          date: '2026-02-20',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-21',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-22',
          count: 6,
          level: 2,
        },
        {
          date: '2026-02-23',
          count: 7,
          level: 2,
        },
        {
          date: '2026-02-24',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-25',
          count: 0,
          level: 0,
        },
        {
          date: '2026-02-26',
          count: 5,
          level: 1,
        },
        {
          date: '2026-02-27',
          count: 3,
          level: 1,
        },
        {
          date: '2026-02-28',
          count: 4,
          level: 1,
        },
        {
          date: '2026-03-01',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-02',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-03',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-04',
          count: 6,
          level: 2,
        },
        {
          date: '2026-03-05',
          count: 7,
          level: 2,
        },
        {
          date: '2026-03-06',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-07',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-08',
          count: 5,
          level: 1,
        },
        {
          date: '2026-03-09',
          count: 3,
          level: 1,
        },
        {
          date: '2026-03-10',
          count: 4,
          level: 1,
        },
        {
          date: '2026-03-11',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-12',
          count: 13,
          level: 4,
        },
        {
          date: '2026-03-13',
          count: 14,
          level: 4,
        },
        {
          date: '2026-03-14',
          count: 12,
          level: 4,
        },
        {
          date: '2026-03-15',
          count: 7,
          level: 2,
        },
        {
          date: '2026-03-16',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-17',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-18',
          count: 5,
          level: 1,
        },
        {
          date: '2026-03-19',
          count: 3,
          level: 1,
        },
        {
          date: '2026-03-20',
          count: 4,
          level: 1,
        },
        {
          date: '2026-03-21',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-22',
          count: 13,
          level: 4,
        },
        {
          date: '2026-03-23',
          count: 14,
          level: 4,
        },
        {
          date: '2026-03-24',
          count: 12,
          level: 4,
        },
        {
          date: '2026-03-25',
          count: 0,
          level: 0,
        },
        {
          date: '2026-03-26',
          count: 9,
          level: 3,
        },
        {
          date: '2026-03-27',
          count: 10,
          level: 3,
        },
        {
          date: '2026-03-28',
          count: 5,
          level: 1,
        },
        {
          date: '2026-03-29',
          count: 3,
          level: 1,
        },
        {
          date: '2026-03-30',
          count: 4,
          level: 1,
        },
        {
          date: '2026-03-31',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-01',
          count: 13,
          level: 4,
        },
        {
          date: '2026-04-02',
          count: 14,
          level: 4,
        },
        {
          date: '2026-04-03',
          count: 12,
          level: 4,
        },
        {
          date: '2026-04-04',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-05',
          count: 9,
          level: 3,
        },
        {
          date: '2026-04-06',
          count: 10,
          level: 3,
        },
        {
          date: '2026-04-07',
          count: 11,
          level: 3,
        },
        {
          date: '2026-04-08',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-09',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-10',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-11',
          count: 13,
          level: 4,
        },
        {
          date: '2026-04-12',
          count: 14,
          level: 4,
        },
        {
          date: '2026-04-13',
          count: 12,
          level: 4,
        },
        {
          date: '2026-04-14',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-15',
          count: 9,
          level: 3,
        },
        {
          date: '2026-04-16',
          count: 10,
          level: 3,
        },
        {
          date: '2026-04-17',
          count: 11,
          level: 3,
        },
        {
          date: '2026-04-18',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-19',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-20',
          count: 6,
          level: 2,
        },
        {
          date: '2026-04-21',
          count: 7,
          level: 2,
        },
        {
          date: '2026-04-22',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-23',
          count: 12,
          level: 4,
        },
        {
          date: '2026-04-24',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-25',
          count: 9,
          level: 3,
        },
        {
          date: '2026-04-26',
          count: 10,
          level: 3,
        },
        {
          date: '2026-04-27',
          count: 11,
          level: 3,
        },
        {
          date: '2026-04-28',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-29',
          count: 0,
          level: 0,
        },
        {
          date: '2026-04-30',
          count: 6,
          level: 2,
        },
        {
          date: '2026-05-01',
          count: 7,
          level: 2,
        },
        {
          date: '2026-05-02',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-03',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-04',
          count: 5,
          level: 1,
        },
        {
          date: '2026-05-05',
          count: 3,
          level: 1,
        },
        {
          date: '2026-05-06',
          count: 10,
          level: 3,
        },
        {
          date: '2026-05-07',
          count: 11,
          level: 3,
        },
        {
          date: '2026-05-08',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-09',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-10',
          count: 6,
          level: 2,
        },
        {
          date: '2026-05-11',
          count: 7,
          level: 2,
        },
        {
          date: '2026-05-12',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-13',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-14',
          count: 5,
          level: 1,
        },
        {
          date: '2026-05-15',
          count: 3,
          level: 1,
        },
        {
          date: '2026-05-16',
          count: 4,
          level: 1,
        },
        {
          date: '2026-05-17',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-18',
          count: 13,
          level: 4,
        },
        {
          date: '2026-05-19',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-20',
          count: 6,
          level: 2,
        },
        {
          date: '2026-05-21',
          count: 7,
          level: 2,
        },
        {
          date: '2026-05-22',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-23',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-24',
          count: 5,
          level: 1,
        },
        {
          date: '2026-05-25',
          count: 3,
          level: 1,
        },
        {
          date: '2026-05-26',
          count: 4,
          level: 1,
        },
        {
          date: '2026-05-27',
          count: 0,
          level: 0,
        },
        {
          date: '2026-05-28',
          count: 13,
          level: 4,
        },
        {
          date: '2026-05-29',
          count: 14,
          level: 4,
        },
        {
          date: '2026-05-30',
          count: 12,
          level: 4,
        },
        {
          date: '2026-05-31',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-01',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-02',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-03',
          count: 5,
          level: 1,
        },
        {
          date: '2026-06-04',
          count: 3,
          level: 1,
        },
        {
          date: '2026-06-05',
          count: 4,
          level: 1,
        },
        {
          date: '2026-06-06',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-07',
          count: 13,
          level: 4,
        },
        {
          date: '2026-06-08',
          count: 14,
          level: 4,
        },
        {
          date: '2026-06-09',
          count: 12,
          level: 4,
        },
        {
          date: '2026-06-10',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-11',
          count: 9,
          level: 3,
        },
        {
          date: '2026-06-12',
          count: 10,
          level: 3,
        },
        {
          date: '2026-06-13',
          count: 11,
          level: 3,
        },
        {
          date: '2026-06-14',
          count: 3,
          level: 1,
        },
        {
          date: '2026-06-15',
          count: 4,
          level: 1,
        },
        {
          date: '2026-06-16',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-17',
          count: 13,
          level: 4,
        },
        {
          date: '2026-06-18',
          count: 14,
          level: 4,
        },
        {
          date: '2026-06-19',
          count: 12,
          level: 4,
        },
        {
          date: '2026-06-20',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-21',
          count: 9,
          level: 3,
        },
        {
          date: '2026-06-22',
          count: 10,
          level: 3,
        },
        {
          date: '2026-06-23',
          count: 11,
          level: 3,
        },
        {
          date: '2026-06-24',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-25',
          count: 0,
          level: 0,
        },
        {
          date: '2026-06-26',
          count: 6,
          level: 2,
        },
        {
          date: '2026-06-27',
          count: 13,
          level: 4,
        },
        {
          date: '2026-06-28',
          count: 14,
          level: 4,
        },
        {
          date: '2026-06-29',
          count: 12,
          level: 4,
        },
        {
          date: '2026-06-30',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-01',
          count: 9,
          level: 3,
        },
        {
          date: '2026-07-02',
          count: 10,
          level: 3,
        },
        {
          date: '2026-07-03',
          count: 11,
          level: 3,
        },
        {
          date: '2026-07-04',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-05',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-06',
          count: 6,
          level: 2,
        },
        {
          date: '2026-07-07',
          count: 7,
          level: 2,
        },
        {
          date: '2026-07-08',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-09',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-10',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-11',
          count: 9,
          level: 3,
        },
        {
          date: '2026-07-12',
          count: 10,
          level: 3,
        },
        {
          date: '2026-07-13',
          count: 11,
          level: 3,
        },
        {
          date: '2026-07-14',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-15',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-16',
          count: 6,
          level: 2,
        },
        {
          date: '2026-07-17',
          count: 7,
          level: 2,
        },
        {
          date: '2026-07-18',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-19',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-20',
          count: 5,
          level: 1,
        },
        {
          date: '2026-07-21',
          count: 3,
          level: 1,
        },
        {
          date: '2026-07-22',
          count: 4,
          level: 1,
        },
        {
          date: '2026-07-23',
          count: 11,
          level: 3,
        },
        {
          date: '2026-07-24',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-25',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-26',
          count: 6,
          level: 2,
        },
        {
          date: '2026-07-27',
          count: 7,
          level: 2,
        },
        {
          date: '2026-07-28',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-29',
          count: 0,
          level: 0,
        },
        {
          date: '2026-07-30',
          count: 5,
          level: 1,
        },
        {
          date: '2026-07-31',
          count: 3,
          level: 1,
        },
        {
          date: '2026-08-01',
          count: 4,
          level: 1,
        },
        {
          date: '2026-08-02',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-03',
          count: 13,
          level: 4,
        },
        {
          date: '2026-08-04',
          count: 14,
          level: 4,
        },
        {
          date: '2026-08-05',
          count: 6,
          level: 2,
        },
        {
          date: '2026-08-06',
          count: 7,
          level: 2,
        },
        {
          date: '2026-08-07',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-08',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-09',
          count: 5,
          level: 1,
        },
        {
          date: '2026-08-10',
          count: 3,
          level: 1,
        },
        {
          date: '2026-08-11',
          count: 4,
          level: 1,
        },
        {
          date: '2026-08-12',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-13',
          count: 13,
          level: 4,
        },
        {
          date: '2026-08-14',
          count: 14,
          level: 4,
        },
        {
          date: '2026-08-15',
          count: 12,
          level: 4,
        },
        {
          date: '2026-08-16',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-17',
          count: 9,
          level: 3,
        },
        {
          date: '2026-08-18',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-19',
          count: 5,
          level: 1,
        },
        {
          date: '2026-08-20',
          count: 3,
          level: 1,
        },
        {
          date: '2026-08-21',
          count: 4,
          level: 1,
        },
        {
          date: '2026-08-22',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-23',
          count: 13,
          level: 4,
        },
        {
          date: '2026-08-24',
          count: 14,
          level: 4,
        },
        {
          date: '2026-08-25',
          count: 12,
          level: 4,
        },
        {
          date: '2026-08-26',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-27',
          count: 9,
          level: 3,
        },
        {
          date: '2026-08-28',
          count: 10,
          level: 3,
        },
        {
          date: '2026-08-29',
          count: 11,
          level: 3,
        },
        {
          date: '2026-08-30',
          count: 0,
          level: 0,
        },
        {
          date: '2026-08-31',
          count: 4,
          level: 1,
        },
        {
          date: '2026-09-01',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-02',
          count: 13,
          level: 4,
        },
        {
          date: '2026-09-03',
          count: 14,
          level: 4,
        },
        {
          date: '2026-09-04',
          count: 12,
          level: 4,
        },
        {
          date: '2026-09-05',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-06',
          count: 9,
          level: 3,
        },
        {
          date: '2026-09-07',
          count: 10,
          level: 3,
        },
        {
          date: '2026-09-08',
          count: 11,
          level: 3,
        },
        {
          date: '2026-09-09',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-10',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-11',
          count: 6,
          level: 2,
        },
        {
          date: '2026-09-12',
          count: 7,
          level: 2,
        },
        {
          date: '2026-09-13',
          count: 14,
          level: 4,
        },
        {
          date: '2026-09-14',
          count: 12,
          level: 4,
        },
        {
          date: '2026-09-15',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-16',
          count: 9,
          level: 3,
        },
        {
          date: '2026-09-17',
          count: 10,
          level: 3,
        },
        {
          date: '2026-09-18',
          count: 11,
          level: 3,
        },
        {
          date: '2026-09-19',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-20',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-21',
          count: 6,
          level: 2,
        },
        {
          date: '2026-09-22',
          count: 7,
          level: 2,
        },
        {
          date: '2026-09-23',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-24',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-25',
          count: 5,
          level: 1,
        },
        {
          date: '2026-09-26',
          count: 9,
          level: 3,
        },
        {
          date: '2026-09-27',
          count: 10,
          level: 3,
        },
        {
          date: '2026-09-28',
          count: 11,
          level: 3,
        },
        {
          date: '2026-09-29',
          count: 0,
          level: 0,
        },
        {
          date: '2026-09-30',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-01',
          count: 6,
          level: 2,
        },
        {
          date: '2026-10-02',
          count: 7,
          level: 2,
        },
        {
          date: '2026-10-03',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-04',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-05',
          count: 5,
          level: 1,
        },
        {
          date: '2026-10-06',
          count: 3,
          level: 1,
        },
        {
          date: '2026-10-07',
          count: 4,
          level: 1,
        },
        {
          date: '2026-10-08',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-09',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-10',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-11',
          count: 6,
          level: 2,
        },
        {
          date: '2026-10-12',
          count: 7,
          level: 2,
        },
        {
          date: '2026-10-13',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-14',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-15',
          count: 5,
          level: 1,
        },
        {
          date: '2026-10-16',
          count: 3,
          level: 1,
        },
        {
          date: '2026-10-17',
          count: 4,
          level: 1,
        },
        {
          date: '2026-10-18',
          count: 0,
          level: 0,
        },
        {
          date: '2026-10-19',
          count: 13,
          level: 4,
        },
        {
          date: '2026-10-20',
          count: 14,
          level: 4,
        },
        {
          date: '2026-10-21',
          count: 12,
          level: 4,
        },
        {
          date: '2026-10-22',
          count: 7,
          level: 2,
        },
        {
          date: '2026-10-23',
          count: 0,
          level: 0,
        },
      ],
    },
  },
  collector:
    "import { defineCollector } from '@shiftpane/widget-sdk'\n\nconst levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']\nconst query = `query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {\n  user(login: $login) {\n    login\n    contributionsCollection(from: $from, to: $to) {\n      contributionCalendar {\n        weeks { contributionDays { date contributionCount contributionLevel } }\n      }\n    }\n  }\n}`\n\nexport default defineCollector(async ({ config, secrets, fetch, signal }) => {\n  const username = typeof config.username === 'string' ? config.username.trim() : ''\n  if (!/^[a-z\\d](?:[a-z\\d-]{0,37}[a-z\\d])?$/i.test(username) || username.includes('--')) {\n    throw new Error('Enter a valid GitHub username, not an organization or profile URL.')\n  }\n  if (!secrets.GITHUB_TOKEN?.trim())\n    throw new Error('Add a GitHub token in this widget’s settings.')\n  const now = new Date()\n  const endDate = now.toISOString().slice(0, 10)\n  const from = new Date(now)\n  const month = from.getUTCMonth()\n  from.setUTCFullYear(from.getUTCFullYear() - 1)\n  if (from.getUTCMonth() !== month) from.setUTCDate(0)\n  const startDate = from.toISOString().slice(0, 10)\n  let response\n  try {\n    response = await fetch('https://api.github.com/graphql', {\n      method: 'POST',\n      headers: {\n        Authorization: `Bearer ${secrets.GITHUB_TOKEN}`,\n        Accept: 'application/vnd.github+json',\n        'Content-Type': 'application/json',\n      },\n      body: JSON.stringify({\n        query,\n        variables: { login: username, from: from.toISOString(), to: now.toISOString() },\n      }),\n      signal,\n    })\n  } catch {\n    throw new Error('Cannot reach GitHub. Try again later.')\n  }\n  if (response.status === 401)\n    throw new Error('GitHub token is invalid or expired. Update it in widget settings.')\n  if (response.status === 403 || response.status === 429)\n    throw new Error(\n      'GitHub access is restricted or rate limited. Try again later or check token permissions.',\n    )\n  if (!response.ok) throw new Error(`GitHub request failed (${response.status}). Try again later.`)\n  let result\n  try {\n    result = await response.json()\n  } catch {\n    throw new Error('GitHub returned an unreadable response.')\n  }\n  if (Array.isArray(result?.errors) && result.errors.length) {\n    if (result.errors.some((error) => error.type === 'NOT_FOUND'))\n      throw new Error('GitHub user not found. Check the username.')\n    throw new Error(\n      'GitHub could not provide contributions. Check token permissions or try again later.',\n    )\n  }\n  const user = result?.data?.user\n  if (user === null) throw new Error('GitHub user not found. Check the username.')\n  const weeks = user?.contributionsCollection?.contributionCalendar?.weeks\n  if (typeof user?.login !== 'string' || !Array.isArray(weeks) || weeks.length > 54)\n    throw new Error('GitHub returned an invalid calendar.')\n  const days = []\n  const dates = new Set()\n  for (const week of weeks) {\n    if (!Array.isArray(week?.contributionDays) || week.contributionDays.length > 7)\n      throw new Error('GitHub returned an invalid calendar.')\n    for (const day of week.contributionDays) {\n      const date = day?.date\n      const count = day?.contributionCount\n      const level = levels.indexOf(day?.contributionLevel)\n      if (\n        typeof date !== 'string' ||\n        !/^\\d{4}-\\d{2}-\\d{2}$/.test(date) ||\n        !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||\n        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date ||\n        !Number.isSafeInteger(count) ||\n        count < 0 ||\n        level < 0 ||\n        dates.has(date)\n      ) {\n        throw new Error('GitHub returned an invalid calendar.')\n      }\n      dates.add(date)\n      if (date >= startDate && date <= endDate) days.push({ date, count, level })\n    }\n  }\n  days.sort((a, b) => a.date.localeCompare(b.date))\n  if (!days.length) throw new Error('GitHub returned an empty calendar. Try again later.')\n  return { username: user.login, calendar: { startDate, endDate, days } }\n})\n",
  readme:
    "GitHub contributions as large green squares. Small shows 8 recent calendar weeks and medium shows 12, with no visible text. Large shows the trailing year in two stacked grids, with username, month labels, and total. Weeks run Sunday–Saturday; missing and future dates stay blank.\n\n## Setup\n\n1. Install the widget in ShiftPane 0.6.0 or later.\n2. Enter your GitHub.com username in widget settings. Organizations and Enterprise servers are not supported.\n3. Create a fine-grained personal access token in GitHub Settings → Developer settings → Personal access tokens. Public repository read access is included; do not grant write access for this widget. Follow GitHub's [GraphQL authentication guidance](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql).\n4. Add the token as **GITHUB_TOKEN** in this widget's Secrets settings on your PC. This is separate from signing in to the marketplace.\n\n## What it shows\n\nThe calendar refreshes every 30 minutes while active. GitHub supplies the dates and five activity levels; the widget uses a fixed green palette. Dates are displayed as GitHub returns them, without shifting to the phone's timezone. Activity reflects what GitHub exposes to your token. Private contribution counts depend on GitHub profile visibility and token permissions; this widget never queries repository names or private contribution details.\n\nIf a refresh fails, existing data stays visible until a successful refresh. Missing or expired tokens, invalid usernames, restricted access, rate limits, and malformed responses produce concise errors in the app's existing collector diagnostics. Before the first successful load, the widget waits for data. Gallery previews use fictional, fixed sample activity; installed widgets never use that sample as real activity.\n\n## Permissions\n\n- **Can reach api.github.com** only, to read GitHub's contribution calendar using GraphQL.\n- **Needs GITHUB_TOKEN.** ShiftPane encrypts it on your PC. It goes only to GitHub, never into the calendar data sent to the phone or marketplace.\n- No PC data, local network access, or actions.\n\n## Release compatibility\n\nThis package introduces the contribution-calendar view node and requires ShiftPane 0.6.0. Release the compatible app and SDK before publishing this widget through the first-party workflow. Version 0.5.0 cannot render it.\n",
}
