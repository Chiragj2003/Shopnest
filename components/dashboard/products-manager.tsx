"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileDown,
  GripVertical,
  Instagram,
  Package,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductFormDialog, type ProductDraft } from "@/components/dashboard/product-form-dialog";
import { InstagramImport } from "@/app/dashboard/products/instagram-import";
import { deleteProduct, reorderProducts } from "@/lib/actions/products";
import { downloadCatalogPdf } from "@/lib/catalog-pdf";
import { formatINR } from "@/lib/whatsapp";
import { FREE_PRODUCT_LIMIT } from "@/lib/validation";
import type { Product, Seller } from "@/lib/types";

function SortableCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`card-soft card-hover group overflow-hidden ${isDragging ? "z-10 opacity-80 shadow-2xl" : ""}`}
    >
      <div className="relative aspect-square bg-muted">
        {product.image_urls[0] ? (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/60 text-muted-foreground/50">
              <Package className="h-5 w-5" />
            </span>
          </div>
        )}
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="absolute left-2 top-2 cursor-grab rounded-lg bg-white/85 p-1.5 opacity-0 shadow backdrop-blur transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {!product.in_stock && (
          <span className="absolute right-2 top-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-muted-foreground">₹{formatINR(product.price)}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button onClick={onEdit} aria-label="Edit" className="press rounded-lg p-1.5 hover:bg-secondary">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} aria-label="Delete" className="press rounded-lg p-1.5 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductsManager({
  initialProducts,
  seller,
}: {
  initialProducts: Product[];
  seller: Seller;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft | undefined>(undefined);
  const [igOpen, setIgOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const atLimit = !seller.is_premium && products.length >= FREE_PRODUCT_LIMIT;

  const openAdd = (prefill?: ProductDraft) => {
    if (atLimit) return setLimitOpen(true);
    setEditing(null);
    setDraft(prefill);
    setFormOpen(true);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const next = arrayMove(products, oldIndex, newIndex);
    setProducts(next); // optimistic
    const res = await reorderProducts(next.map((p) => p.id));
    if (!res.ok) {
      setProducts(products);
      toast.error("Could not save order");
    }
  };

  const onDelete = async (p: Product) => {
    const prev = products;
    setProducts(products.filter((x) => x.id !== p.id));
    const res = await deleteProduct(p.id);
    if (!res.ok) {
      setProducts(prev);
      toast.error(res.error);
    } else {
      toast.success(`Deleted "${p.name}"`);
    }
  };

  const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${seller.slug}`;

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}
            {!seller.is_premium && ` · ${FREE_PRODUCT_LIMIT - products.length} left on free plan`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pdfBusy || products.length === 0}
            onClick={async () => {
              setPdfBusy(true);
              try {
                await downloadCatalogPdf({ storeName: seller.store_name, storeUrl, products });
                toast.success("Catalog downloaded");
              } finally {
                setPdfBusy(false);
              }
            }}
          >
            <FileDown className="mr-1.5 h-4 w-4" /> Catalog PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => (atLimit ? setLimitOpen(true) : setIgOpen(true))}>
            <Instagram className="mr-1.5 h-4 w-4" /> Import
          </Button>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="mr-1.5 h-4 w-4" /> Add product
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card-soft">
          <EmptyState
            icon={Package}
            title="Your shelf is empty"
            description="Add your first product, or import one straight from an Instagram post."
          >
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => setIgOpen(true)}>
                <Instagram className="mr-1.5 h-4 w-4" /> Import from Instagram
              </Button>
              <Button onClick={() => openAdd()}>
                <Plus className="mr-1.5 h-4 w-4" /> Add product
              </Button>
            </div>
          </EmptyState>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={products.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <SortableCard
                  key={p.id}
                  product={p}
                  onEdit={() => {
                    setEditing(p);
                    setDraft(undefined);
                    setFormOpen(true);
                  }}
                  onDelete={() => void onDelete(p)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        draft={draft}
        onSaved={(p, isNew) =>
          setProducts((prev) => (isNew ? [...prev, p] : prev.map((x) => (x.id === p.id ? p : x))))
        }
        onLimit={() => setLimitOpen(true)}
      />

      <InstagramImport open={igOpen} onOpenChange={setIgOpen} onImport={(d) => openAdd(d)} />

      {/* free plan limit dialog */}
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Sparkles className="h-5 w-5 text-primary" /> You&apos;ve hit the free limit
            </DialogTitle>
            <DialogDescription>
              The free plan includes {FREE_PRODUCT_LIMIT} products. Upgrade to Premium for
              unlimited products, and keep growing your store.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => toast.info("Premium is coming soon — stay tuned!")}>
            <Sparkles className="mr-1.5 h-4 w-4" /> Upgrade to Premium
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
