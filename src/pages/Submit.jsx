import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../api/api";
import { Button, Input, Select, PageHeader, ErrorBox } from "../components/ui";
import { useToast } from "../components/Toast";
import { HouseIcon, FoodIcon, BusIcon, MapPinIcon, CheckIcon, XIcon, ImageIcon, UploadIcon, TrashIcon } from "../components/Icons";
import MapPicker from "../components/MapPicker";

// University centre coordinates for the map default view
const UNI_CENTERS = {
  "University of Moratuwa":                        [6.7955, 79.9012],
  "University of Colombo":                         [6.9022, 79.8607],
  "University of Kelaniya":                        [7.0013, 79.9207],
  "University of Peradeniya":                      [7.2545, 80.5954],
  "University of Sri Jayewardenepura":             [6.8719, 79.8989],
  "University of Jaffna":                          [9.6615, 80.0255],
  "University of Ruhuna":                          [5.9485, 80.5376],
  "Eastern University Sri Lanka":                  [7.7102, 81.6924],
  "SLIIT":                                         [6.9147, 79.9729],
  "NSBM Green University":                         [6.8290, 80.0370],
  default:                                         [6.7955, 79.9012],
};

const CATEGORIES = [
  { value: "BOARDING", label: "Boarding / Room for rent", Icon: HouseIcon, color: "#2563EB", bg: "#EFF6FF" },
  { value: "FOOD",     label: "Food spot / Restaurant",   Icon: FoodIcon,  color: "#EA580C", bg: "#FFF7ED" },
  { value: "TRANSPORT",label: "Transport / Bus route",    Icon: BusIcon,   color: "#16A34A", bg: "#F0FDF4" },
];

const FOOD_TAGS = ["Vegetarian", "Veg-Only", "Non-Veg"];
const GENDER_OPTIONS = [
  { value: "",       label: "Select..." },
  { value: "Boys",   label: "Boys only" },
  { value: "Girls",  label: "Girls only" },
  { value: "Mixed",  label: "Mixed / Any" },
];

export default function Submit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { show, ToastEl } = useToast();

  const [category, setCategory] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", price: "", area: "",
    genderType: "", hasKitchen: false,
    tags: [], contact: "",
    routeNumber: "", from: "", to: "",
  });
  const [pickedLocation, setPickedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [images, setImages] = useState([]); // { id, file, preview, name }
  const fileInputRef = useRef(null);

  const MAX_IMAGES = 5;

  const handleImageFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, MAX_IMAGES - images.length);
    const newImgs = valid.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(0) + " KB",
    }));
    setImages((prev) => [...prev, ...newImgs].slice(0, MAX_IMAGES));
  }, [images.length]);

  const removeImage = (id) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  const toggleTag = (tag) => set("tags", form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]);

  const validate = () => {
    const e = {};
    if (!category) { e.category = "Please choose a listing category."; return e; }
    if (!form.title.trim()) e.title = "Please provide a title for your listing.";
    else if (form.title.trim().length < 5) e.title = "Title should be at least 5 characters.";
    if (!form.description.trim()) e.description = "Please add a short description.";
    else if (form.description.trim().length < 20) e.description = "Description should be at least 20 characters so students know what to expect.";
    if (!form.area.trim()) e.area = "Please enter the area or street name.";
    if (category === "BOARDING") {
      if (!form.price) e.price = "Please enter the monthly rent.";
      else if (isNaN(form.price) || Number(form.price) < 1000) e.price = "Rent should be a valid amount (at least Rs. 1,000).";
      if (!form.genderType) e.genderType = "Please select who this boarding is for.";
      if (!form.contact.trim()) e.contact = "Please provide a contact number.";
    }
    if (category === "FOOD") {
      if (!form.price) e.price = "Please enter the approximate price range (e.g. 150-350).";
    }
    if (category === "TRANSPORT") {
      if (!form.routeNumber.trim()) e.routeNumber = "Please enter the route or bus number.";
      if (!form.from.trim()) e.from = "Please enter the starting point.";
      if (!form.to.trim()) e.to = "Please enter the destination.";
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    const payload = {
      category,
      title: form.title.trim(),
      description: form.description.trim(),
      area: form.area.trim(),
      university: user?.university,
      ...(pickedLocation && { location: { latitude: pickedLocation[0], longitude: pickedLocation[1] } }),
      // images: in production these would be uploaded to Cloudinary/S3 first
      // and the returned URLs stored. For now we store the file names.
      images: images.map((img) => img.name),
      ...(category === "BOARDING" && { price: Number(form.price), genderType: form.genderType, hasKitchen: form.hasKitchen, contact: form.contact.trim() }),
      ...(category === "FOOD" && { priceRange: form.price, tags: form.tags }),
      ...(category === "TRANSPORT" && { routeNumber: form.routeNumber.trim(), from: form.from.trim(), to: form.to.trim() }),
    };

    const res = await createPost(payload);
    setLoading(false);
    if (!res.success) { setServerError(res.message); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 20, textAlign: "center" }}>
        {ToastEl}
        <div style={{ width: 72, height: 72, background: "#F0FDF4", border: "2px solid #86EFAC", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckIcon size={32} color="#16A34A" strokeWidth={2.5} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Listing submitted!</h2>
          <p style={{ fontSize: 14, color: "#64748B", maxWidth: 380, lineHeight: 1.7 }}>
            Your listing is now pending review by the campus admin. You'll be notified once it's approved and visible to students.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button variant="secondary" onClick={() => { setSubmitted(false); setCategory(""); setForm({ title: "", description: "", price: "", area: "", genderType: "", hasKitchen: false, tags: [], contact: "", routeNumber: "", from: "", to: "" }); }}>
            Submit another
          </Button>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {ToastEl}
      <PageHeader title="Add a new listing" subtitle="Help fellow students by sharing verified, accurate information." />

      {serverError && <div style={{ marginBottom: 20 }}><ErrorBox message={serverError} /></div>}

      <form onSubmit={handleSubmit} noValidate>

        {/* Step 1 — Category */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 26px", marginBottom: 18, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>What are you listing?</h3>
          <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 18 }}>Choose the type that best describes your submission.</p>
          {errors.category && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 12 }}>{errors.category}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {CATEGORIES.map(({ value, label, Icon, color, bg }) => (
              <button key={value} type="button" onClick={() => setCategory(value)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 12px", borderRadius: 14, border: `2px solid ${category === value ? color : "#E2E8F0"}`, background: category === value ? bg : "#F8FAFC", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ color: category === value ? color : "#94A3B8" }}><Icon size={26} /></div>
                <span style={{ fontSize: 12, fontWeight: 600, color: category === value ? color : "#64748B", textAlign: "center", lineHeight: 1.4 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Details */}
        {category && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px 26px", marginBottom: 18, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 18 }}>Listing details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Title" placeholder={category === "BOARDING" ? "e.g. Spacious 2-sharing room near main gate" : category === "FOOD" ? "e.g. Green Leaf Cafe" : "e.g. Route 138 — Moratuwa to Colombo"} value={form.title} error={errors.title} onChange={(e) => set("title", e.target.value)} />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder={category === "BOARDING" ? "Describe the room — size, bathroom, amenities, rules, etc." : category === "FOOD" ? "What kind of food? Special dishes? Opening hours?" : "Describe the route, stops, and frequency."}
                  rows={4}
                  style={{ padding: "10px 14px", border: `1.5px solid ${errors.description ? "#FCA5A5" : "#E2E8F0"}`, borderRadius: 10, fontSize: 13, background: errors.description ? "#FEF2F2" : "#fff", color: "#0F172A", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                />
                {errors.description && <p style={{ fontSize: 11.5, color: "#DC2626", fontWeight: 500 }}>{errors.description}</p>}
              </div>
              <Input label="Area / Street" placeholder="e.g. Katubedda, near the engineering faculty" icon={<MapPinIcon size={14} />} value={form.area} error={errors.area} onChange={(e) => set("area", e.target.value)} />

              {/* ── Map location picker ── */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>
                  Pin exact location on map <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>(optional but recommended)</span>
                </label>

                {/* Toggle button */}
                {!showMap ? (
                  <button type="button" onClick={() => setShowMap(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "13px 16px", borderRadius: 12,
                      border: `2px dashed ${pickedLocation ? "#86EFAC" : "#BFDBFE"}`,
                      background: pickedLocation ? "#F0FDF4" : "#F8FBFF",
                      cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.background = "#EFF6FF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = pickedLocation ? "#86EFAC" : "#BFDBFE"; e.currentTarget.style.background = pickedLocation ? "#F0FDF4" : "#F8FBFF"; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: pickedLocation ? "#DCFCE7" : "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPinIcon size={18} color={pickedLocation ? "#16A34A" : "#2563EB"} />
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      {pickedLocation ? (
                        <>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#15803D" }}>Location pinned</div>
                          <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                            {pickedLocation[0].toFixed(5)}, {pickedLocation[1].toFixed(5)} · Click to reopen map
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#2563EB" }}>Open map to drop a pin</div>
                          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>Click on the real-world map to mark the exact location</div>
                        </>
                      )}
                    </div>
                    {pickedLocation && (
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setPickedLocation(null); }}
                        style={{ background: "#FEE2E2", border: "none", borderRadius: 7, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                        <XIcon size={12} color="#DC2626" />
                      </button>
                    )}
                  </button>
                ) : (
                  <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #BFDBFE", boxShadow: "0 4px 20px rgba(37,99,235,0.12)" }}>
                    {/* Map header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "linear-gradient(90deg,#1D4ED8,#2563EB)", color: "white" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPinIcon size={14} color="white" />
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>Drop a pin on the exact location</span>
                      </div>
                      <button type="button" onClick={() => setShowMap(false)}
                        style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 7, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                        <XIcon size={13} color="white" />
                      </button>
                    </div>

                    {/* Real map */}
                    <MapPicker
                      center={UNI_CENTERS[user?.university] || UNI_CENTERS.default}
                      zoom={15}
                      markers={[]}
                      pickMode={true}
                      onPick={(lat, lng) => {
                        setPickedLocation([lat, lng]);
                        // Auto-fill area from reverse geocode happens inside MapPicker
                      }}
                      pickedPoint={pickedLocation}
                      height="340px"
                    />

                    {/* Confirm / close bar */}
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
                      {pickedLocation ? (
                        <>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#15803D" }}>
                              Pin set — {pickedLocation[0].toFixed(5)}, {pickedLocation[1].toFixed(5)}
                            </span>
                          </div>
                          <Button size="sm" variant="success" type="button" onClick={() => setShowMap(false)}>
                            <CheckIcon size={12} /> Confirm location
                          </Button>
                          <Button size="sm" variant="secondary" type="button" onClick={() => { setPickedLocation(null); }}>
                            Reset
                          </Button>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94A3B8", flex: 1 }}>Click anywhere on the map to place your pin</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Image Upload ── */}
              {category !== "TRANSPORT" && (
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <ImageIcon size={14} color="#2563EB" />
                    Photos
                    <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>({images.length}/{MAX_IMAGES} — {category === "BOARDING" ? "room photos" : "food photos"})</span>
                  </label>

                  {/* Drop zone */}
                  {images.length < MAX_IMAGES && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFiles(e.dataTransfer.files); }}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: `2px dashed ${dragOver ? "#3B82F6" : "#BFDBFE"}`,
                        borderRadius: 14,
                        padding: "24px 20px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: dragOver ? "#EFF6FF" : "#F8FBFF",
                        transition: "all 0.2s",
                        marginBottom: images.length > 0 ? 12 : 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.background = "#EFF6FF"; }}
                      onMouseLeave={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.background = "#F8FBFF"; } }}
                    >
                      <div style={{ width: 44, height: 44, background: "#DBEAFE", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                        <UploadIcon size={22} color="#2563EB" />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", marginBottom: 4 }}>
                        Drop photos here or click to browse
                      </div>
                      <div style={{ fontSize: 11.5, color: "#94A3B8" }}>
                        PNG, JPG, WEBP up to 5MB each · Max {MAX_IMAGES} photos
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => handleImageFiles(e.target.files)}
                      />
                    </div>
                  )}

                  {/* Preview grid */}
                  {images.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                      {images.map((img, idx) => (
                        <div key={img.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", background: "#F1F5F9", border: "1.5px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                          <img
                            src={img.preview}
                            alt={img.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                          {/* Primary badge */}
                          {idx === 0 && (
                            <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(37,99,235,0.9)", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>
                              Cover
                            </div>
                          )}
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", transition: "background 0.15s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.85)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.55)"}
                          >
                            <XIcon size={11} color="white" />
                          </button>
                          {/* File name tooltip */}
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "12px 7px 5px" }}>
                            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.size}</div>
                          </div>
                        </div>
                      ))}
                      {/* Add more tile */}
                      {images.length < MAX_IMAGES && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ aspectRatio: "4/3", borderRadius: 12, border: "2px dashed #BFDBFE", background: "#F8FBFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", color: "#2563EB", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.background = "#EFF6FF"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.background = "#F8FBFF"; }}
                        >
                          <ImageIcon size={20} color="#2563EB" />
                          <span style={{ fontSize: 10.5, fontWeight: 600 }}>Add more</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Boarding-specific */}
              {category === "BOARDING" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Input label="Monthly rent (Rs.)" type="number" placeholder="e.g. 8500" value={form.price} error={errors.price} onChange={(e) => set("price", e.target.value)} />
                    <Select label="Gender" options={GENDER_OPTIONS} value={form.genderType} error={errors.genderType} onChange={(e) => set("genderType", e.target.value)} />
                  </div>
                  <Input label="Contact number" type="tel" placeholder="e.g. 0712345678" value={form.contact} error={errors.contact} onChange={(e) => set("contact", e.target.value)} />
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <div onClick={() => set("hasKitchen", !form.hasKitchen)}
                      style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.hasKitchen ? "#2563EB" : "#CBD5E1"}`, background: form.hasKitchen ? "#2563EB" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                      {form.hasKitchen && <CheckIcon size={11} color="white" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>Kitchen area available</span>
                  </label>
                </>
              )}

              {/* Food-specific */}
              {category === "FOOD" && (
                <>
                  <Input label="Price range" placeholder="e.g. Rs. 150–350" value={form.price} error={errors.price} onChange={(e) => set("price", e.target.value)} />
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>Dietary tags</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {FOOD_TAGS.map((tag) => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)}
                          style={{ padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${form.tags.includes(tag) ? "#16A34A" : "#E2E8F0"}`, background: form.tags.includes(tag) ? "#F0FDF4" : "#fff", fontSize: 12, fontWeight: 600, color: form.tags.includes(tag) ? "#15803D" : "#64748B", cursor: "pointer", transition: "all 0.15s" }}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Transport-specific */}
              {category === "TRANSPORT" && (
                <>
                  <Input label="Route / Bus number" placeholder="e.g. 138" value={form.routeNumber} error={errors.routeNumber} onChange={(e) => set("routeNumber", e.target.value)} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Input label="From (starting point)" placeholder="e.g. Katubedda" value={form.from} error={errors.from} onChange={(e) => set("from", e.target.value)} />
                    <Input label="To (destination)" placeholder="e.g. Colombo Fort" value={form.to} error={errors.to} onChange={(e) => set("to", e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 12.5, color: "#1E40AF", lineHeight: 1.7 }}>
          <strong>What happens next?</strong> Your listing will be reviewed by the campus admin within 24–48 hours. Once approved, it will appear on the platform for all students at {user?.university || "your university"}.
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={!category} style={{ flex: 1 }}>
            Submit for review
          </Button>
        </div>
      </form>
    </div>
  );
}
