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
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
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
import { EmptyState } from "@/components/ui/empty-state";
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

const SECTION_LIBRARY: Array<{ type: SectionType; label: string; emoji: string; desc: string }> = [
  { type: "hero", label: "Hero", emoji: "👋", desc: "Logo, name & tagline" },
  { type: "text", label: "Text", emoji: "✍️", desc: "A paragraph of copy" },
  { type: "image", label: "Image", emoji: "🖼️", desc: "A full-width photo" },
  { type: "products", label: "Products", emoji: "🛍️", desc: "Your product grid" },
  { type: "testimonials", label: "Testimonials", emoji: "💬", desc: "Customer quotes" },
  { type: "faq", label: "FAQ", emoji: "❓", desc: "Common questions" },
  { type: "socials", label: "Socials", emoji: "🔗", desc: "Links to your profiles" },
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
        { q: "How do I pay?", a: "Pay on delivery, or settle up with us over WhatsApp." },
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
      className={`group card-soft overflow-hidden ${isDragging ? "z-10 rotate-[0.4deg] opacity-90 shadow-2xl" : ""} ${
        expanded ? "ring-2 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="hidden cursor-grab rounded-md p-1.5 text-muted-foreground/50 hover:bg-secondary hover:text-foreground active:cursor-grabbing sm:block"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-1 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-base">
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
        <div className="flex shrink-0 items-center gap-0.5 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
            className="press rounded-md p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-25"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label="Move down"
            className="press rounded-md p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-25"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            aria-label="Duplicate section"
            className="press rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete section"
            className="press rounded-md p-1.5 text-destructive hover:bg-destructive/10"
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
  const [addOpen, setAddOpen] = useState(false);

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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Store builder</h1>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Build your page on the left, style it on the right — the preview is live.
          </p>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              dirty ? "bg-amber-500/10 text-amber-700" : "bg-emerald-500/10 text-emerald-700"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} />
            {dirty ? "Unsaved changes" : "All changes published"}
          </span>
          <Button variant="outline" asChild>
            <a href={`/${seller.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View store
            </a>
          </Button>
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {dirty ? "Publish changes" : "Published"}
          </Button>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_300px]">
        {/* left: sections */}
        <div className={`${tab === "edit" ? "block" : "hidden"} space-y-3 lg:block`}>
          <div className="relative">
            <Button className="w-full" onClick={() => setAddOpen((o) => !o)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add a section
            </Button>
            {addOpen && (
              <>
                <div className="fixed inset-0 z-30" aria-hidden onClick={() => setAddOpen(false)} />
                <div className="absolute left-0 right-0 top-full z-40 mt-2 space-y-0.5 rounded-2xl border bg-popover p-1.5 shadow-xl">
                  {SECTION_LIBRARY.map((s) => (
                    <button
                      key={s.type}
                      onClick={() => {
                        addSection(s.type);
                        setAddOpen(false);
                      }}
                      className="press flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-secondary"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-base">
                        {s.emoji}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-tight">{s.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{s.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {sections.length === 0 ? (
            <div className="card-soft">
              <EmptyState
                icon={Layers}
                title="Start with a ready-made layout"
                description="Hero, products, about & FAQ — pre-arranged. You just fill in your words."
                className="px-5 py-10"
              >
                <Button size="sm" onClick={addStarter}>
                  <Sparkles className="mr-1.5 h-4 w-4" /> Use starter layout
                </Button>
              </EmptyState>
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
            <div className="relative rounded-[2.6rem] border-[11px] border-foreground/90 bg-foreground/90 shadow-[0_30px_70px_-25px_rgba(32,24,16,0.5)]">
              <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-foreground/90" />
              <div className="relative h-[600px] overflow-y-auto scroll-thin rounded-[1.7rem] sm:h-[640px]">
                <StorefrontView
                  seller={previewSeller}
                  sections={previewSections}
                  products={products}
                  preview
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live preview · how buyers see it
            </div>
          </div>
        </div>

        {/* right: style controls */}
        <div className={`${tab === "style" ? "block" : "hidden"} lg:block`}>
          <div className="card-soft divide-y overflow-hidden lg:sticky lg:top-6">
            {/* theme presets */}
            <div className="space-y-2.5 p-4">
              <p className="text-sm font-bold">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((t) => {
                  const active = theme.preset === t.preset;
                  return (
                    <button
                      key={t.preset}
                      onClick={() => {
                        setTheme(t);
                        touch();
                      }}
                      className={`press overflow-hidden rounded-xl border text-left transition-colors ${
                        active ? "border-primary ring-2 ring-primary/20" : "hover:border-foreground/20"
                      }`}
                    >
                      <span
                        className="block h-10 w-full"
                        style={{ background: t.background === "gradient" ? t.bgGradient : t.bg }}
                      />
                      <span className="flex items-center justify-between gap-1 px-2 py-1.5">
                        <span className="truncate text-[11px] font-medium">{t.preset}</span>
                        {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* colors */}
            <div className="space-y-3 p-4">
              <p className="text-sm font-bold">Colors</p>
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs">Accent</Label>
                <label className="press inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1">
                  <span className="h-5 w-5 rounded-md border" style={{ background: theme.accent }} />
                  <span className="text-xs text-muted-foreground">{theme.accent.toUpperCase()}</span>
                  <input
                    type="color"
                    value={theme.accent}
                    onChange={(e) => {
                      setTheme({ ...theme, preset: "Custom", accent: e.target.value });
                      touch();
                    }}
                    className="sr-only"
                  />
                </label>
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
                      className={`press flex-1 rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-colors ${
                        theme.background === bg ? "border-primary bg-primary/5 text-primary" : "hover:bg-secondary"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
                {theme.background === "solid" && (
                  <label className="press flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-2 py-1.5">
                    <span className="text-xs text-muted-foreground">Page color</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{theme.bg.toUpperCase()}</span>
                      <span className="h-5 w-5 rounded-md border" style={{ background: theme.bg }} />
                    </span>
                    <input
                      type="color"
                      value={theme.bg}
                      onChange={(e) => {
                        setTheme({ ...theme, preset: "Custom", bg: e.target.value });
                        touch();
                      }}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* typography */}
            <div className="space-y-1.5 p-4">
              <p className="text-sm font-bold">Typography</p>
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

            {/* buttons */}
            <div className="space-y-1.5 p-4">
              <p className="text-sm font-bold">Buttons</p>
              <div className="flex gap-1.5">
                {(["rounded", "square", "pill"] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => {
                      setTheme({ ...theme, buttonShape: shape });
                      touch();
                    }}
                    className={`press flex-1 border px-2 py-2 text-xs font-medium capitalize transition-colors ${
                      theme.buttonShape === shape ? "border-primary bg-primary/5 text-primary" : "hover:bg-secondary"
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
