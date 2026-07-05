import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/infra/api/apiClient";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Label } from "@/ui/Label";
import { Card, CardContent } from "@/ui/Card";
import { useToast } from "@/shared/hook/use-toast";
import { Plus, Edit, Trash2, Upload, ImageIcon, Loader2, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/Dialog";
import { useNavigate } from "react-router-dom";
import { getMediaUrl } from "@/lib/utils";


interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  sortOrder: number;
}

const emptyForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  active: true,
  sortOrder: 0,
};

export default function AdminBanners() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/banners");
      if (res.data.success) setBanners(res.data.banners || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiClient.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.url) setFormData(f => ({ ...f, imageUrl: res.data.url }));
      else toast({ title: "Upload failed – no URL returned", variant: "destructive" });
    } catch {
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast({ title: "Title and image are required", variant: "destructive" });
      return;
    }
    try {
      if (editingBanner) {
        await apiClient.put(`/banners/${editingBanner.id}`, formData);
        toast({ title: "Banner updated successfully" });
      } else {
        await apiClient.post("/banners", formData);
        toast({ title: "Banner created successfully" });
      }
      setDialogOpen(false);
      fetchBanners();
    } catch {
      toast({ title: "Failed to save banner", variant: "destructive" });
    }
  };

  const handleToggle = async (banner: Banner) => {
    try {
      await apiClient.put(`/banners/${banner.id}`, { ...banner, active: !banner.active });
      fetchBanners();
    } catch { toast({ title: "Failed to update status", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/banners/${id}`);
      toast({ title: "Banner deleted" });
      fetchBanners();
    } catch { toast({ title: "Failed to delete banner", variant: "destructive" }); }
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setFormData({ title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, buttonText: b.buttonText, buttonLink: b.buttonLink, active: b.active, sortOrder: b.sortOrder });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingBanner(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="shrink-0 h-9 rounded-xl border-border/60 bg-card shadow-sm gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Homepage Banners</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Control what users see in the homepage carousel. Changes go live instantly.
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2 w-full md:w-auto shrink-0 h-10 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium mb-1">No banners yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create banners to display in the homepage carousel</p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Create First Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <Card key={b.id} className={`transition-opacity ${!b.active ? "opacity-55" : ""}`}>
              <CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                {b.imageUrl ? (
                  <img src={getMediaUrl(b.imageUrl)} alt={b.title} className="w-20 h-14 sm:w-28 sm:h-18 object-cover rounded-lg flex-shrink-0 border border-border" />
                ) : (
                  <div className="w-20 h-14 sm:w-28 sm:h-18 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base truncate">{b.title}</span>
                    <Badge variant={b.active ? "default" : "secondary"} className="text-xs shrink-0">
                      {b.active ? "Live" : "Hidden"}
                    </Badge>
                  </div>
                  {b.subtitle && <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{b.subtitle}</p>}
                  <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">→ {b.buttonLink}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(b)} title={b.active ? "Hide banner" : "Show banner"}>
                    {b.active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "Create New Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium">Banner Image *</Label>
              <div
                className="mt-1.5 border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => fileRef.current?.click()}
              >
                {formData.imageUrl ? (
                  <img src={getMediaUrl(formData.imageUrl)} alt="Preview" className="w-full h-36 object-cover rounded-lg mb-2" />
                ) : (
                  <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                )}
                {uploading
                  ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                  : <p className="text-sm text-muted-foreground">{formData.imageUrl ? "Click to replace image" : "Click to upload image"}</p>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Or paste image URL directly:</p>
                <Input placeholder="https://example.com/banner.jpg" value={formData.imageUrl}
                  onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Title *</Label>
                <Input className="mt-1.5" placeholder="e.g. Summer Sale 2025" value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm font-medium">Subtitle</Label>
                <Input className="mt-1.5" placeholder="e.g. Up to 40% off" value={formData.subtitle}
                  onChange={e => setFormData(f => ({ ...f, subtitle: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Button Text</Label>
                <Input className="mt-1.5" placeholder="Shop Now" value={formData.buttonText}
                  onChange={e => setFormData(f => ({ ...f, buttonText: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm font-medium">Button Link</Label>
                <Input className="mt-1.5" placeholder="/products" value={formData.buttonLink}
                  onChange={e => setFormData(f => ({ ...f, buttonLink: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <input type="checkbox" id="active-toggle" checked={formData.active}
                onChange={e => setFormData(f => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 rounded border-2 border-border accent-primary cursor-pointer" />
              <Label htmlFor="active-toggle" className="cursor-pointer text-sm">
                <span className="font-medium">Show on homepage</span>
                <span className="text-muted-foreground ml-1.5">(uncheck to hide)</span>
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={uploading} className="gap-2">
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
