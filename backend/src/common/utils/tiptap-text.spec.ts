import { describe, expect, it } from 'vitest';
import { extractTiptapText } from './tiptap-text.js';

describe('extractTiptapText', () => {
  it('returns empty for non-objects', () => {
    expect(extractTiptapText(null)).toBe('');
    expect(extractTiptapText('x')).toBe('');
  });

  it('flattens nested text nodes', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Firmware' },
            { type: 'text', text: ' dump' },
          ],
        },
        {
          type: 'codeBlock',
          content: [{ type: 'text', text: 'binwalk -e' }],
        },
      ],
    };

    expect(extractTiptapText(doc)).toBe('Firmware dump binwalk -e');
  });
});
