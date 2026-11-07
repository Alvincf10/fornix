import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { common, createLowlight } from 'lowlight';
import { EMPTY_TIPTAP_DOC } from '../../core/models/workspace.models';

const lowlight = createLowlight(common);

@Component({
  selector: 'app-doc-editor',
  template: `
    @if (!readonly) {
      <div class="toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" (click)="bold()" [class.on]="is('bold')">Bold</button>
        <button type="button" (click)="italic()" [class.on]="is('italic')">Italic</button>
        <button type="button" (click)="setHeading(1)" [class.on]="isHeading(1)">H1</button>
        <button type="button" (click)="setHeading(2)" [class.on]="isHeading(2)">H2</button>
        <button type="button" (click)="setHeading(3)" [class.on]="isHeading(3)">H3</button>
        <button type="button" (click)="bullet()">Bullets</button>
        <button type="button" (click)="ordered()">Numbered</button>
        <button type="button" (click)="tasks()">Checklist</button>
        <button type="button" (click)="quote()">Quote</button>
        <button type="button" (click)="divider()">Divider</button>
        <button type="button" (click)="inlineCode()">Inline code</button>
        <button type="button" (click)="insertCodeBlock()">Code block</button>
        <button type="button" (click)="insertTable()">Table</button>
        <button type="button" (click)="insertLink()">Link</button>
        <button type="button" (click)="insertImage()">Image URL</button>
        <label class="lang">
          Lang
          <select [value]="codeLang" (change)="onLang($event)">
            @for (lang of languages; track lang) {
              <option [value]="lang">{{ lang }}</option>
            }
          </select>
        </label>
      </div>
    }
    <div #host class="surface" [class.readonly]="readonly"></div>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 0.65rem;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .toolbar button,
      .lang select {
        border: 1px solid var(--fx-line);
        background: var(--fx-paper-raised);
        color: var(--fx-ink);
        border-radius: var(--fx-radius-control);
        padding: 0.35rem 0.55rem;
        font: inherit;
        font-size: 0.8rem;
        cursor: pointer;
      }

      .toolbar button.on {
        background: var(--fx-accent-soft);
        color: var(--fx-accent-strong);
        border-color: transparent;
      }

      .lang {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        color: var(--fx-ink-muted);
      }

      .surface {
        min-height: 22rem;
        padding: 1rem 1.1rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-panel);
        background: var(--fx-paper-raised);
      }

      .surface.readonly {
        background: transparent;
      }

      :host ::ng-deep .ProseMirror {
        outline: none;
        min-height: 20rem;
        font-size: 0.975rem;
        line-height: 1.65;
      }

      :host ::ng-deep .ProseMirror h1,
      :host ::ng-deep .ProseMirror h2,
      :host ::ng-deep .ProseMirror h3 {
        line-height: 1.25;
        margin: 1.1rem 0 0.5rem;
      }

      :host ::ng-deep .ProseMirror pre {
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 0.4rem;
        padding: 0.85rem 1rem;
        overflow-x: auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.85rem;
      }

      :host ::ng-deep .ProseMirror code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      :host ::ng-deep .ProseMirror blockquote {
        margin: 0.75rem 0;
        padding: 0.35rem 0.85rem;
        border-left: 3px solid var(--fx-accent);
        color: var(--fx-ink-muted);
        background: var(--fx-accent-soft);
      }

      :host ::ng-deep .ProseMirror table {
        border-collapse: collapse;
        width: 100%;
        margin: 0.75rem 0;
      }

      :host ::ng-deep .ProseMirror th,
      :host ::ng-deep .ProseMirror td {
        border: 1px solid var(--fx-line);
        padding: 0.4rem 0.55rem;
        vertical-align: top;
      }

      :host ::ng-deep .ProseMirror ul[data-type='taskList'] {
        list-style: none;
        padding-left: 0.2rem;
      }

      :host ::ng-deep .ProseMirror li[data-type='taskItem'] {
        display: flex;
        gap: 0.45rem;
      }

      :host ::ng-deep .ProseMirror img {
        max-width: 100%;
        border-radius: 0.35rem;
      }

      :host ::ng-deep .ProseMirror p.is-editor-empty:first-child::before {
        color: #94a3b8;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
    `,
  ],
})
export class DocEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  @Input() content: Record<string, unknown> | null = null;
  @Input() readonly = false;
  @Output() contentChange = new EventEmitter<Record<string, unknown>>();

  readonly languages = [
    'bash',
    'python',
    'javascript',
    'typescript',
    'php',
    'json',
    'yaml',
    'sql',
    'c',
    'cpp',
  ];

  codeLang = 'bash';
  private editor?: Editor;
  private ready = false;

  ngAfterViewInit() {
    this.editor = new Editor({
      element: this.host.nativeElement,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({
          placeholder: 'Write findings, commands, and notes…',
        }),
        Link.configure({ openOnClick: this.readonly }),
        Image,
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
        CodeBlockLowlight.configure({ lowlight }),
      ],
      content: this.content ?? EMPTY_TIPTAP_DOC,
      editable: !this.readonly,
      onUpdate: ({ editor }) => {
        this.contentChange.emit(editor.getJSON() as Record<string, unknown>);
      },
    });
    this.ready = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.editor || !this.ready) {
      return;
    }

    if (changes['readonly']) {
      this.editor.setEditable(!this.readonly);
    }

    if (changes['content'] && !changes['content'].firstChange) {
      const next = this.content ?? EMPTY_TIPTAP_DOC;
      const current = JSON.stringify(this.editor.getJSON());
      if (JSON.stringify(next) !== current) {
        this.editor.commands.setContent(next);
      }
    }
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }

  is(mark: string) {
    return this.editor?.isActive(mark) ?? false;
  }

  isHeading(level: 1 | 2 | 3) {
    return this.editor?.isActive('heading', { level }) ?? false;
  }

  bold() {
    this.editor?.chain().focus().toggleBold().run();
  }

  italic() {
    this.editor?.chain().focus().toggleItalic().run();
  }

  setHeading(level: 1 | 2 | 3) {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  bullet() {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  ordered() {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  tasks() {
    this.editor?.chain().focus().toggleTaskList().run();
  }

  quote() {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  divider() {
    this.editor?.chain().focus().setHorizontalRule().run();
  }

  inlineCode() {
    this.editor?.chain().focus().toggleCode().run();
  }

  insertCodeBlock() {
    this.editor
      ?.chain()
      .focus()
      .toggleCodeBlock({ language: this.codeLang })
      .run();
  }

  insertTable() {
    this.editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }

  insertLink() {
    const href = window.prompt('Link URL');
    if (!href) {
      return;
    }
    this.editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  insertImage() {
    const src = window.prompt('Image URL');
    if (!src) {
      return;
    }
    this.editor?.chain().focus().setImage({ src }).run();
  }

  onLang(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.codeLang = value;
    if (this.editor?.isActive('codeBlock')) {
      this.editor.chain().focus().updateAttributes('codeBlock', { language: value }).run();
    }
  }
}
