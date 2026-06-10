"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { saveSections, type SectionInput } from "@/lib/actions/sections";
import { saveTheme, uploadImage } from "@/lib/actions/seller";
import { FONT_PAIRS, THEME_PRESETS, buttonRadius } from "@/lib/themes";
import type {
  Product,
  SectionContent,
  SectionType,
  Seller,
  StoreSection,
  StoreTheme,
} from "@/lib/types";

type LocalSection = { localId: string; type: SectionType; content: SectionContent };

const SECTION_LIBRARY: Array<{ type: SectionType; label: string; emoji: string }> = [
  { type: "hero", label: "Hero", emoji: "👋" },
  { type: "text", label: "Text", emoji: "✍️" },
  { type: "image", label: "Image", emoji: "🖼️" },
  { type: "products", label: "Products", emoji: "🛍️" },
  { type: "testimonials", label: "Testimonials", emoji: "💬" },
  { type: "faq", label: "FAQ", emoji: "❓" },
  { type: "socials", label: "Socials", emoji: "🔗" },
];

const DEFAULT_CONTENT: Record<SectionType, SectionContent> = {
  hero: {},
  text: { title: "About us", body: "" },
  image: {},
  products: { title: "Shop" },
  testimonials: { title: "What customers say", items: [] },
  faq: { title: "FAQ", items: [] },
  socials: { items: [] },
};

function ImageField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="press flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      {value ? "Replace image" : "Upload image"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const compressed = await imageCompression(file, {
              maxSizeMB: 0.9,
              maxWidthOrHeight: 1600,
              useWebWorker: true,
            });
            const fd = new FormData();
            fd.append("file", new File([compressed], file.name, { type: compressed.type }));
            const res = await uploadImage(fd);
            if (res.ok && res.data) onChange(res.data);
            else toast.error(res.ok ? "Upload failed" : res.error);
          } finally {
            setBusy(false);
          }
        }}
      />
    </label>
  );
}

function ItemsEditor({
  items,
  fields,
  onChange,
}: {
  items: Array<Record<string, string>>;
  fields: Array<{ key: string; placeholder: string; textarea?: boolean }>;
  onChange: (items: Array<Record<string, string>>) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="space-y-1.5 rounded-xl border p-2.5">
          {fields.map((f) =>
            f.textarea ? (
              <Textarea
                key={f.key}
                rows={2}
                placeholder={f.placeholder}
                value={item[f.key] ?? ""}
                onChange={(e) =>
                  onChange(items.map((it, j) => (j === i ? { ...it, [f.key]: e.target.value } : it)))
                }
              />
            ) : (
              <Input
                key={f.key}
                placeholder={f.placeholder}
                value={item[f.key] ?? ""}
                onChange={(e) =>
                  onChange(items.map((it, j) => (j === i ? { ...it, [f.key]: e.target.value } : it)))
                }
              />
            )
          )}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="inline-flex items-center gap-1 text-xs text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, {}])}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
}: {
  section: LocalSection;
  onChange: (content: SectionContent) => void;
}) {
  const c = section.content;
  const set = (patch: SectionContent) => onChange({ ...c, ...patch });

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-2">
          <Input placeholder="Headline (defaults to store name)" value={c.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
          <Input placeholder="Tagline (defaults to bio)" value={c.subtitle ?? ""} onChange={(e) => set({ subtitle: e.target.value })} />
          <ImageField value={c.imageUrl} onChange={(url) => set({ imageUrl: url })} />
        </div>
      );
    case "text":
      return (
        <div className="space-y-2">
          <Input placeholder="Heading" value={c.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
          <Textarea rows={3} placeholder="Your text…" value={c.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <ImageField value={c.imageUrl} onChange={(url) => set({ imageUrl: url })} />
          <Input placeholder="Caption (optional)" value={c.caption ?? ""} onChange={(e) => set({ caption: e.target.value })} />
        </div>
      );
    case "products":
      return <Input placeholder="Section title" value={c.title ?? ""} onChange={(e) => set({ title: e.target.value })} />;
    case "testimonials":
      return (
        <div className="space-y-2">
          <Input placeholder="Section title" value={c.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
          <ItemsEditor
            items={c.items ?? []}
            fields={[
              { key: "name", placeholder: "Customer name" },
              { key: "text", placeholder: "What they said", textarea: true },
            ]}
            onChange={(items) => set({ items })}
          />
        </div>
      );
    case "faq":
      return (
        <div className="space-y-2">
          <Input placeholder="Section title" value={c.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
          <ItemsEditor
            items={c.items ?? []}
            fields={[
              { key: "q", placeholder: "Question" },
              { key: "a", placeholder: "Answer", textarea: true },
            ]}
            onChange={(items) => set({ items })}
          />
        </div>
      );
    case "socials":
      return (
        <ItemsEditor
          items={c.items ?? []}
          fields={[
            { key: "platform", placeholder: "Platform (Instagram, YouTube…)" },
            { key: "url", placeholder: "https://…" },
          ]}
          onChange={(items) => set({ items })}
        />
      );
  }
}

function SortableSection({
  section,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  section: LocalSection;
  expanded: boolean;
  onToggle: () => void;
  onChange: (content: SectionContent) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.localId });
  const meta = SECTION_LIBRARY.find((s) => s.type === section.type)!;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`card-soft ${isDragging ? "z-10 opacity-80" : ""}`}
    >
      <div className="flex items-center gap-2 p-2.5">
        <button {...attributes} {...listeners} aria-label="Drag" className="cursor-grab rounded-md p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left text-sm font-semibold">
          <span>{meta.emoji}</span> {meta.label}
          <ChevronDown className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        <button onClick={onDelete} aria-label="Delete section" className="press rounded-md p-1 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {expanded && (
        <div className="border-t p-3">
          <SectionEditor section={section} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

export function StoreBuilder({
  seller,
  initialSections,
  products,
}: {
  seller: Seller;
  initialSections: StoreSection[];
  products: Product[];
}) {
  const [sections, setSections] = useState<LocalSection[]>(
    initialSections.map((s) => ({ localId: s.id, type: s.type, content: s.content ?? {} }))
  );
  const [theme, setTheme] = useState<StoreTheme>(seller.theme ?? THEME_PRESETS[0]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const previewSeller: Seller = useMemo(() => ({ ...seller, theme }), [seller, theme]);
  const previewSections: StoreSection[] = useMemo(
    () =>
      sections.map((s, i) => ({
        id: s.localId,
        seller_id: seller.id,
        type: s.type,
        content: s.content,
        sort_order: i,
      })),
    [sections, seller.id]
  );

  const touch = () => setDirty(true);

  const addSection = (type: SectionType) => {
    const localId = crypto.randomUUID();
    setSections((prev) => [...prev, { localId, type, content: { ...DEFAULT_CONTENT[type] } }]);
    setExpanded(localId);
    touch();
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const from = prev.findIndex((s) => s.localId === active.id);
      const to = prev.findIndex((s) => s.localId === over.id);
      return arrayMove(prev, from, to);
    });
    touch();
  };

  const save = async () => {
    setSaving(true);
    const payload: SectionInput[] = sections.map((s) => ({ type: s.type, content: s.content }));
    const [sectionsRes, themeRes] = await Promise.all([saveSections(payload), saveTheme(theme)]);
    setSaving(false);
    if (sectionsRes.ok && themeRes.ok) {
      setDirty(false);
      toast.success("Store published ✨");
    } else {
      toast.error((!sectionsRes.ok && sectionsRes.error) || (!themeRes.ok && themeRes.error) || "Save failed");
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Store Builder</h1>
          <p className="text-sm text-muted-foreground">Drag sections, tune the look — the preview is live.</p>
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {dirty ? "Publish changes" : "Published"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)_270px]">
        {/* left: sections */}
        <div className="space-y-4">
          <div className="card-soft p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Add section</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SECTION_LIBRARY.map((s) => (
                <button
                  key={s.type}
                  onClick={() => addSection(s.type)}
                  className="press flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                >
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sections.map((s) => s.localId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.length === 0 && (
                  <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                    No sections yet — your store shows a default hero + products. Add sections to customize.
                  </p>
                )}
                {sections.map((s) => (
                  <SortableSection
                    key={s.localId}
                    section={s}
                    expanded={expanded === s.localId}
                    onToggle={() => setExpanded(expanded === s.localId ? null : s.localId)}
                    onChange={(content) => {
                      setSections((prev) => prev.map((x) => (x.localId === s.localId ? { ...x, content } : x)));
                      touch();
                    }}
                    onDelete={() => {
                      setSections((prev) => prev.filter((x) => x.localId !== s.localId));
                      touch();
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* center: live phone preview */}
        <div className="order-first lg:order-none">
          <div className="mx-auto w-[375px] max-w-full">
            <div className="overflow-hidden rounded-[2.4rem] border-[10px] border-foreground/90 shadow-2xl">
              <div className="h-[640px] overflow-y-auto scroll-thin relative">
                <StorefrontView
                  seller={previewSeller}
                  sections={previewSections}
                  products={products}
                  preview
                />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Live preview · 375px</p>
          </div>
        </div>

        {/* right: style controls */}
        <div className="space-y-4">
          <div className="card-soft space-y-3 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Theme preset</p>
            <div className="grid grid-cols-5 gap-1.5">
              {THEME_PRESETS.map((t) => (
                <button
                  key={t.preset}
                  title={t.preset}
                  onClick={() => {
                    setTheme(t);
                    touch();
                  }}
                  className={`press aspect-square rounded-lg border-2 ${
                    theme.preset === t.preset ? "border-primary" : "border-transparent"
                  }`}
                  style={{ background: t.background === "gradient" ? t.bgGradient : t.bg }}
                />
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Accent color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accent}
                  onChange={(e) => {
                    setTheme({ ...theme, preset: "Custom", accent: e.target.value });
                    touch();
                  }}
                  className="h-8 w-12 cursor-pointer rounded border"
                />
                <span className="text-xs text-muted-foreground">{theme.accent}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Background</Label>
              <div className="flex gap-1.5">
                {(["solid", "gradient"] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => {
                      setTheme({ ...theme, background: bg });
                      touch();
                    }}
                    className={`press flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize ${
                      theme.background === bg ? "border-primary text-primary" : ""
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
              {theme.background === "solid" && (
                <input
                  type="color"
                  value={theme.bg}
                  onChange={(e) => {
                    setTheme({ ...theme, preset: "Custom", bg: e.target.value });
                    touch();
                  }}
                  className="h-8 w-full cursor-pointer rounded border"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Font pair</Label>
              <select
                value={theme.fontPair}
                onChange={(e) => {
                  setTheme({ ...theme, fontPair: e.target.value });
                  touch();
                }}
                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
              >
                {FONT_PAIRS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Button shape</Label>
              <div className="flex gap-1.5">
                {(["rounded", "square", "pill"] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => {
                      setTheme({ ...theme, buttonShape: shape });
                      touch();
                    }}
                    className={`press flex-1 border px-2 py-1.5 text-xs font-medium capitalize ${
                      theme.buttonShape === shape ? "border-primary text-primary" : ""
                    }`}
                    style={{ borderRadius: buttonRadius(shape) }}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
