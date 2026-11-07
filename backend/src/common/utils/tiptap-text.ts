type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
};

export function extractTiptapText(doc: unknown): string {
  if (!doc || typeof doc !== 'object') {
    return '';
  }

  const parts: string[] = [];
  const walk = (node: TipTapNode) => {
    if (node.text) {
      parts.push(node.text);
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child);
      }
    }
  };

  walk(doc as TipTapNode);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
