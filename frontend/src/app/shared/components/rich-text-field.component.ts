import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

/** Turn legacy plain text (with newlines) into TipTap-friendly HTML. */
export function plainTextToHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return value;
  }
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return trimmed
    .split(/\n{2,}/)
    .map((para) => `<p>${escape(para).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function normalizeStoredHtml(html: string): string {
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  return text ? html : '';
}

@Component({
  selector: 'app-rich-text-field',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextFieldComponent),
      multi: true,
    },
  ],
  template: `
    <div class="field" [class.readonly]="readonly" [class.disabled]="disabled">
      @if (!readonly) {
        <div class="toolbar" role="toolbar" [attr.aria-label]="label + ' formatting'">
          <button type="button" (click)="bold()" [class.on]="is('bold')" [disabled]="disabled">
            Bold
          </button>
          <button type="button" (click)="italic()" [class.on]="is('italic')" [disabled]="disabled">
            Italic
          </button>
          <button type="button" (click)="bullet()" [class.on]="is('bulletList')" [disabled]="disabled">
            Bullets
          </button>
          <button
            type="button"
            (click)="ordered()"
            [class.on]="is('orderedList')"
            [disabled]="disabled"
          >
            Numbered
          </button>
          <button type="button" (click)="code()" [class.on]="is('code')" [disabled]="disabled">
            Code
          </button>
          <button type="button" (click)="link()" [class.on]="is('link')" [disabled]="disabled">
            Link
          </button>
        </div>
      }
      <div
        #host
        class="surface"
        [attr.aria-label]="label"
        [attr.aria-readonly]="readonly || null"
      ></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .field {
        display: grid;
        gap: 0.45rem;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }

      .toolbar button {
        border: 1px solid var(--fx-line);
        background: var(--fx-paper-raised);
        color: var(--fx-ink);
        border-radius: var(--fx-radius-control);
        padding: 0.3rem 0.5rem;
        font: inherit;
        font-size: 0.78rem;
        cursor: pointer;
      }

      .toolbar button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .toolbar button.on {
        background: var(--fx-accent-soft);
        color: var(--fx-accent-strong);
        border-color: transparent;
      }

      .surface {
        min-height: 9rem;
        padding: 0.75rem 0.9rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-panel);
        background: var(--fx-paper-raised);
      }

      .readonly .surface {
        min-height: 0;
        border: none;
        padding: 0;
        background: transparent;
      }

      .disabled .surface {
        opacity: 0.65;
        pointer-events: none;
      }

      :host ::ng-deep .ProseMirror {
        outline: none;
        min-height: 7.5rem;
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--fx-ink);
      }

      .field.readonly ::ng-deep .ProseMirror {
        min-height: 0;
        color: var(--fx-ink-muted);
      }

      :host ::ng-deep .ProseMirror p {
        margin: 0 0 0.65rem;
      }

      :host ::ng-deep .ProseMirror p:last-child {
        margin-bottom: 0;
      }

      :host ::ng-deep .ProseMirror ul,
      :host ::ng-deep .ProseMirror ol {
        margin: 0.35rem 0 0.65rem;
        padding-left: 1.25rem;
      }

      :host ::ng-deep .ProseMirror code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.85em;
        background: var(--fx-accent-soft);
        padding: 0.05rem 0.3rem;
        border-radius: 0.25rem;
      }

      :host ::ng-deep .ProseMirror a {
        color: var(--fx-accent-strong);
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
export class RichTextFieldComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor
{
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  @Input() label = 'Description';
  @Input() placeholder = 'Description';
  @Input() readonly = false;

  disabled = false;

  private editor?: Editor;
  private pending: string | null = null;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngAfterViewInit() {
    const initial = this.pending ?? '';
    this.pending = null;

    this.editor = new Editor({
      element: this.host.nativeElement,
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
        }),
        Placeholder.configure({
          placeholder: this.placeholder,
        }),
        Link.configure({
          openOnClick: this.readonly,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        }),
      ],
      content: plainTextToHtml(initial) || '',
      editable: !this.readonly && !this.disabled,
      onUpdate: ({ editor }) => {
        this.onChange(normalizeStoredHtml(editor.getHTML()));
      },
      onBlur: () => this.onTouched(),
    });
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }

  writeValue(value: string | null): void {
    const next = value ?? '';
    if (!this.editor) {
      this.pending = next;
      return;
    }
    const html = plainTextToHtml(next);
    if (normalizeStoredHtml(this.editor.getHTML()) === normalizeStoredHtml(html)) {
      return;
    }
    this.editor.commands.setContent(html || '', { emitUpdate: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.editor?.setEditable(!this.readonly && !isDisabled);
  }

  is(mark: string) {
    return this.editor?.isActive(mark) ?? false;
  }

  bold() {
    this.editor?.chain().focus().toggleBold().run();
  }

  italic() {
    this.editor?.chain().focus().toggleItalic().run();
  }

  bullet() {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  ordered() {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  code() {
    this.editor?.chain().focus().toggleCode().run();
  }

  link() {
    if (!this.editor) {
      return;
    }
    if (this.editor.isActive('link')) {
      this.editor.chain().focus().unsetLink().run();
      return;
    }
    const href = window.prompt('Link URL');
    if (!href) {
      return;
    }
    this.editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }
}
