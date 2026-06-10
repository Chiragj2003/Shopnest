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
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Eye,
  GripVertical,
  ImagePlus,
  Layers,
  Loader2,
  Paintbrush,
  Plus,
  Save,
  Sparkles,
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
type BuilderTab = "edit" | "preview" | "style";

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

const newId = () => crypto.randomUUID();

const STARTER: LocalSection[] = [
  { localId: "", type: "hero", content: {} },
  { localId: "", type: "products", content: { title: "Shop" } },
  {
    localId: "",
    type: "text",
    content: { title: "About us", body: "Tell buyers your story — what you make, since when, and why they'll love it." },
  },
  {
    localId: "",
    type: "faq",
    content: {
      title: "FAQ",
      items: [
        { q: "Do you deliver?", a: "Yes — message us on WhatsApp for delivery details." },
        { q: "How do I pay?", a: "UPI on delivery, or scan the QR on this page." },
      ],
    },
  },
];

function sectionSummary(s: LocalSection): string {
  const c = s.content;
  if (c.title) return c.title;
  if (c.body) return c.body.slice(0, 36);
  if (c.caption) return c.caption.slice(0, 36);
  if (c.items?.length) return `${c.items.length} item${c.items.length === 1 ? "" : "s"}`;
  if (c.imageUrl) return "1 image";
  return "Tap to edit";
}

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
  index,
  count,
  expanded,
  onToggle,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
}: {
  section: LocalSection;
  index: number;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (content: SectionContent) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.localId });
  const meta = SECTION_LIBRARY.find((s) => s.type === section.type)!;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`card-soft overflow-hidden ${isDragging ? "z-10 opacity-80 shadow-2xl" : ""} ${
        expanded ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 p-2.5">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag"
          className="hidden cursor-grab rounded-md p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing sm:block"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-base">
            {meta.emoji}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">{meta.label}</span>
            <span className="block truncate text-xs text-muted-foreground">{sectionSummary(section)}</span>
          </span>
          <ChevronDown
            className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <div className="flex shrink-0 items-center">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
            className="press rounded-md p-1 text-muted-foreground hover:bg-secondary disabled:opacity-25"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label="Move down"
            className="press rounded-md p-1 text-muted-foreground hover:bg-secondary disabled:opacity-25"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            aria-label="Duplicate section"
            className="press rounded-md p-1 text-muted-foreground hover:bg-secondary"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete section"
            className="press rounded-md p-1 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t bg-secondary/30 p-3">
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
  const [tab, setTab] = useState<BuilderTab>("edit");

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
    const localId = newId();
    setSections((prev) => [...prev, { localId, type, content: { ...DEFAULT_CONTENT[type] } }]);
    setExpanded(localId);
    setTab("edit");
    touch();
  };

  const addStarter = () => {
    setSections(STARTER.map((s) => ({ ...s, localId: newId(), content: { ...s.content } })));
    toast.success("Starter layout added — customize away!");
    touch();
  };

  const moveSection = (localId: string, dir: -1 | 1) => {
    setSections((prev) => {
      const i = prev.findIndex((s) => s.localId === localId);
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      return arrayMove(prev, i, j);
    });
    touch();
  };

  const duplicateSection = (localId: string) => {
    setSections((prev) => {
      const i = prev.findIndex((s) => s.localId === localId);
      const copy: LocalSection = {
        localId: newId(),
        type: prev[i].type,
        content: JSON.parse(JSON.stringify(prev[i].content)),
      };
      return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
    });
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

  const TABS: Array<{ id: BuilderTab; label: string; icon: typeof Layers }> = [
    { id: "edit", label: "Sections", icon: Layers },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "style", label: "Style", icon: Paintbrush },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Store Builder</h1>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Drag sections, tune the look — the preview is live.
          </p>
        </div>
        <Button onClick={save} disabled={saving || !dirty} className="hidden lg:inline-flex">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {dirty ? "Publish changes" : "Published"}
        </Button>
      </div>

      {/* mobile tab switcher */}
      <div className="sticky top-14 z-30 -mx-4 mb-4 flex gap-1 border-b bg-background/90 px-4 pb-2 backdrop-blur lg:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`press flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              tab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_280px]">
        {/* left: sections */}
        <div className={`${tab === "edit" ? "block" : "hidden"} space-y-4 lg:block`}>
          <div className="card-soft p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Add section</p>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-2">
              {SECTION_LIBRARY.map((s) => (
                <button
                  key={s.type}
                  onClick={() => addSection(s.type)}
                  className="press flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-medium hover:border-primary hover:bg-primary/5 hover:text-primary lg:flex-row lg:gap-1.5 lg:py-1.5 lg:text-xs"
                >
                  <span className="text-base lg:text-sm">{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="card-soft flex flex-col items-center gap-3 p-6 text-center">
              <p className="text-4xl">🎨</p>
              <p className="text-sm font-semibold">Start with a ready-made layout</p>
              <p className="text-xs text-muted-foreground">
                Hero, products, about & FAQ — pre-arranged. You just fill in your words.
              </p>
              <Button size="sm" onClick={addStarter}>
                <Sparkles className="mr-1.5 h-4 w-4" /> Use starter layout
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sections.map((s) => s.localId)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {sections.map((s, i) => (
                    <SortableSection
                      key={s.localId}
                      section={s}
                      index={i}
                      count={sections.length}
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
                      onDuplicate={() => duplicateSection(s.localId)}
                      onMove={(dir) => moveSection(s.localId, dir)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* center: live phone preview */}
        <div className={`${tab === "preview" ? "block" : "hidden"} lg:block`}>
          <div className="mx-auto w-[375px] max-w-full lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[2.4rem] border-[10px] border-foreground/90 shadow-2xl">
              <div className="relative h-[600px] overflow-y-auto scroll-thin sm:h-[640px]">
                <StorefrontView
                  seller={previewSeller}
                  sections={previewSections}
                  products={products}
                  preview
                />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Live preview · how buyers see it</p>
          </div>
        </div>

        {/* right: style controls */}
        <div className={`${tab === "style" ? "block" : "hidden"} space-y-4 lg:block`}>
          <div className="card-soft space-y-4 p-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Theme preset</p>
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
                      theme.preset === t.preset ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    }`}
                    style={{ background: t.background === "gradient" ? t.bgGradient : t.bg }}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{theme.preset}</p>
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
                  className="h-9 w-14 cursor-pointer rounded-lg border"
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
                    className={`press flex-1 rounded-lg border px-2 py-2 text-xs font-medium capitalize ${
                      theme.background === bg ? "border-primary bg-primary/5 text-primary" : ""
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
                  className="h-9 w-full cursor-pointer rounded-lg border"
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
                className="w-full rounded-lg border bg-background px-2 py-2 text-xs"
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
                    className={`press flex-1 border px-2 py-2 text-xs font-medium capitalize ${
                      theme.buttonShape === shape ? "border-primary bg-primary/5 text-primary" : ""
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

      {/* floating publish button (mobile) */}
      {dirty && (
        <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 lg:hidden">
          <Button onClick={save} disabled={saving} className="w-full max-w-sm shadow-2xl">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publish changes
          </Button>
        </div>
      )}
    </div>
  );
}
