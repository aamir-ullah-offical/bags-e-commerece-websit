import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Star, Upload, Download, Save, Users } from "lucide-react";
import { Category, Testimonial } from "../../types";
import { NewsSubscriber } from "../../utils/adminService";

interface Props {
  subTab: "categories" | "reviews" | "newsletter";
  categories: Category[];
  testimonials: Testimonial[];
  subscribers: NewsSubscriber[];
  onSaveCategories: (list: Category[]) => void;
  onSaveTestimonials: (list: Testimonial[]) => void;
  onSaveSubscribers: (list: NewsSubscriber[]) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  autoOpenAdd?: boolean;
  onClearAutoOpen?: () => void;
}

export default function GeneralTabs({
  subTab,
  categories,
  testimonials,
  subscribers,
  onSaveCategories,
  onSaveTestimonials,
  onSaveSubscribers,
  triggerToast,
  autoOpenAdd,
  onClearAutoOpen,
}: Props) {
  // Common Search Filter State
  const [query, setQuery] = useState("");

  // Categories Forms State
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [isAddCat, setIsAddCat] = useState(false);
  const [catNameForm, setCatNameForm] = useState("");
  const [catImageForm, setCatImageForm] = useState("");

  // Reviews Testimonial Forms State
  const [editReview, setEditReview] = useState<Testimonial | null>(null);
  const [isAddRev, setIsAddRev] = useState(false);
  const [revForm, setRevForm] = useState({
    name: "",
    photo: "",
    rating: 5,
    comment: "",
    role: "Collector",
  });

  // Export Newsletter subscriber base simulation
  const handleExportNewsletter = () => {
    if (subscribers.length === 0) {
      triggerToast("No subscribers currently present to export", "info");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Email Address,Subscription Date", ...subscribers.map(s => `${s.email},${s.date}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maison_sac_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Newsletter subscribers exported as CSV successfully!", "success");
  };

  // Delete Newsletter sub
  const handleDeleteSub = (id: string) => {
    const confirmation = window.confirm("Erase this email address from the campaign subscriber list?");
    if (confirmation) {
      onSaveSubscribers(subscribers.filter((s) => s.id !== id));
      triggerToast("Subscriber deleted", "success");
    }
  };

  // Add Cat Form handler
  const handleOpenCatAdd = () => {
    setCatNameForm("");
    setCatImageForm("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80");
    setIsAddCat(true);
  };

  const handleOpenCatEdit = (cat: Category) => {
    setEditCategory(cat);
    setCatNameForm(cat.name);
    setCatImageForm(cat.image);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameForm.trim()) {
      triggerToast("Category Name is required", "warning");
      return;
    }

    if (isAddCat) {
      const nextId = (categories.length + 1).toString();
      const newCat: Category = {
        id: nextId,
        name: catNameForm.trim(),
        image: catImageForm || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
        count: 0,
      };
      onSaveCategories([...categories, newCat]);
      setIsAddCat(false);
      triggerToast(`Category "${newCat.name}" launched successfully`, "success");
    } else if (editCategory) {
      const updated = categories.map((c) => {
        if (c.id === editCategory.id) {
          return {
            ...c,
            name: catNameForm.trim(),
            image: catImageForm,
          };
        }
        return c;
      });
      onSaveCategories(updated);
      setEditCategory(null);
      triggerToast(`Category "${catNameForm}" updated successfully`, "success");
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const conf = window.confirm(`Are you sure you want to remove the Category "${name}"? Existing items linked to this category might lose their hierarchy.`);
    if (conf) {
      onSaveCategories(categories.filter((c) => c.id !== id));
      triggerToast(`Category hierarchy removed`, "success");
    }
  };

  // Add/Edit reviews
  const handleOpenRevAdd = () => {
    setRevForm({
      name: "Isabella Dubois",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80",
      rating: 5,
      comment: "Uncompromising leather weight, and neat double stitching. Worth every single cent.",
      role: "Atelier Aficionado",
    });
    setIsAddRev(true);
  };

  useEffect(() => {
    if (autoOpenAdd) {
      if (subTab === "categories") {
        handleOpenCatAdd();
      } else if (subTab === "reviews") {
        handleOpenRevAdd();
      }
      if (onClearAutoOpen) {
        onClearAutoOpen();
      }
    }
  }, [autoOpenAdd, subTab]);

  const handleOpenRevEdit = (rev: Testimonial) => {
    setEditReview(rev);
    setRevForm({
      name: rev.name,
      photo: rev.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80",
      rating: rev.rating,
      comment: rev.comment,
      role: rev.role || "Elite connoisseur",
    });
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revForm.name.trim()) {
      triggerToast("Customer Name is required", "warning");
      return;
    }

    if (isAddRev) {
      const nextId = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.id)) + 1 : 1;
      const newRev: Testimonial = {
        id: nextId,
        name: revForm.name.trim(),
        photo: revForm.photo,
        rating: Number(revForm.rating),
        comment: revForm.comment,
        role: revForm.role,
      };
      onSaveTestimonials([...testimonials, newRev]);
      setIsAddRev(false);
      triggerToast("Customer review submitted for homepage presentation", "success");
    } else if (editReview) {
      const updated = testimonials.map((t) => {
        if (t.id === editReview.id) {
          return {
            ...t,
            name: revForm.name.trim(),
            photo: revForm.photo,
            rating: Number(revForm.rating),
            comment: revForm.comment,
            role: revForm.role,
          };
        }
        return t;
      });
      onSaveTestimonials(updated);
      setEditReview(null);
      triggerToast("Public review modified", "success");
    }
  };

  const handleDeleteReview = (id: number) => {
    const confirmation = window.confirm("Erase this testimony permanently?");
    if (confirmation) {
      onSaveTestimonials(testimonials.filter((t) => t.id !== id));
      triggerToast("Client testimonial removed", "success");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-6" id="general-tabs-master">
      {/* Search Header for all sub tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={
              subTab === "categories"
                ? "Search luxury categories..."
                : subTab === "reviews"
                ? "Search customer feedback..."
                : "Search email addresses..."
            }
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-500 bg-stone-50/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {subTab === "categories" && (
          <button
            onClick={handleOpenCatAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Create Category
          </button>
        )}

        {subTab === "reviews" && (
          <button
            onClick={handleOpenRevAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Add Testimonial
          </button>
        )}

        {subTab === "newsletter" && (
          <button
            onClick={handleExportNewsletter}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md font-mono"
          >
            <Download className="w-4 h-4 text-white" />
            EXPORT SUBSCRIBERS
          </button>
        )}
      </div>

      {/* ================= CATEGORIES SUB TAB ================= */}
      {subTab === "categories" && (
        <div className="overflow-x-auto" id="categories-database-table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                <th className="py-3 px-4">Image Banner</th>
                <th className="py-3 px-4">Category Slug Name</th>
                <th className="py-3 px-4 text-center">Connected items</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
              {categories
                .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
                .map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={cat.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-16 h-10 object-cover rounded-lg border border-stone-200"
                      />
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-stone-900">{cat.name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-500">
                      {cat.count || 0} Products
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenCatEdit(cat)}
                          className="px-2.5 py-1.5 border border-stone-200 hover:text-amber-600 rounded-lg text-[11px] transition-all"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="px-2.5 py-1.5 border border-stone-200 text-rose-500 hover:bg-rose-50 rounded-lg text-[11px] transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= REVIEWS TESTIMONIALS SUB TAB ================= */}
      {subTab === "reviews" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reviews-grid-panel">
          {testimonials
            .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.comment.toLowerCase().includes(query.toLowerCase()))
            .map((t) => (
              <div key={t.id} className="p-5 border border-stone-200 rounded-2xl shadow-xs bg-stone-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={t.photo}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="font-sans font-extrabold text-stone-900 text-xs">{t.name}</h4>
                      <span className="text-[10px] text-stone-400 font-medium font-mono">{t.role || "Elite Collector"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "fill-amber-500 text-amber-500" : "text-stone-200"}`} />
                    ))}
                  </div>
                  <p className="text-stone-600 text-xs italic leading-relaxed">"{t.comment}"</p>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-stone-150/40 mt-4 font-semibold text-xs">
                  <button
                    onClick={() => handleOpenRevEdit(t)}
                    className="px-3 py-1.5 border border-stone-200 rounded-xl hover:text-amber-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(t.id)}
                    className="px-3 py-1.5 border border-stone-200 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    Erase
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ================= NEWSLETTER SUB TAB ================= */}
      {subTab === "newsletter" && (
        <div className="overflow-x-auto" id="newsletter-grid-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                <th className="py-3 px-4">Subscriber Address</th>
                <th className="py-3 px-4">Fulfillment Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
              {subscribers
                .filter((s) => s.email.toLowerCase().includes(query.toLowerCase()))
                .map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-stone-900 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      {sub.email}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">{sub.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 tracking-wider font-mono">
                        ACTIVE CAMPAIGN
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteSub(sub.id)}
                        className="px-2.5 py-1.5 border border-stone-200 text-rose-500 hover:bg-rose-50 rounded-lg text-[11px] transition-all font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= CATEGORY FORM MODAL ================= */}
      {(isAddCat || editCategory) && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-100 max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddCat(false);
                setEditCategory(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-sans font-extrabold text-stone-900 text-sm mb-4">
              {isAddCat ? "Introduce New Atelier Category" : "Edit Luxury Collection Category"}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crossbody Bags"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
                  value={catNameForm}
                  onChange={(e) => setCatNameForm(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Category Image Cover (URL)</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  value={catImageForm}
                  onChange={(e) => setCatImageForm(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCat(false);
                    setEditCategory(null);
                  }}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl shadow-md transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TESTIMONIAL REVIEW FORM MODAL ================= */}
      {(isAddRev || editReview) && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-100 max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddRev(false);
                setEditReview(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-sans font-extrabold text-stone-900 text-sm mb-4">
              {isAddRev ? "Register Brand Testimony" : "Modify Customer Voice Details"}
            </h3>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Client Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Isabella Dubois"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
                  value={revForm.name}
                  onChange={(e) => setRevForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Role / Distinction</label>
                  <input
                    type="text"
                    placeholder="Collector / Aficionado"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    value={revForm.role}
                    onChange={(e) => setRevForm((prev) => ({ ...prev, role: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Testimonial Stars</label>
                  <select
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-white"
                    value={revForm.rating}
                    onChange={(e) => setRevForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  >
                    <option value={5}>5-Stars</option>
                    <option value={4}>4-Stars</option>
                    <option value={3}>3-Stars</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Avatars / Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  value={revForm.photo}
                  onChange={(e) => setRevForm((prev) => ({ ...prev, photo: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Feedback Comment</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write the public customer feedback quote here..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  value={revForm.comment}
                  onChange={(e) => setRevForm((prev) => ({ ...prev, comment: e.target.value }))}
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRev(false);
                    setEditReview(null);
                  }}
                  className="px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl shadow-md transition-all bg-stone-950 text-white"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
