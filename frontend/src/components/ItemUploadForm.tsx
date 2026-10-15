"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Sparkles,
  Info,
  Tag,
  Shield,
  User,
  FileText,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  ReportType,
  ItemCategory,
  UploadedImage,
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
  COMMON_COLORS,
  StoredItemReport,
} from "../types/item";

interface ItemUploadFormProps {
  onReportCreated?: (report: StoredItemReport) => void;
}

export default function ItemUploadForm({ onReportCreated }: ItemUploadFormProps) {
  // Form State
  const [reportType, setReportType] = useState<ReportType>("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ItemCategory>("electronics");
  const [brand, setBrand] = useState("");
  const [primaryColor, setPrimaryColor] = useState("Black");
  const [secondaryColor, setSecondaryColor] = useState("None");
  const [campusLocation, setCampusLocation] = useState(CAMPUS_LOCATIONS[0].id);
  const [specificLocation, setSpecificLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [uniqueMarks, setUniqueMarks] = useState("");
  const [secretVerificationHint, setSecretVerificationHint] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [consentPrivacy, setConsentPrivacy] = useState(true);

  // Uploaded images state
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>("");
  const [submittedReport, setSubmittedReport] = useState<StoredItemReport | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Image Upload Handlers
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const maxImages = 4;

    if (images.length + files.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    const newUploaded: UploadedImage[] = [];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`"${file.name}" is not a supported format (JPG, PNG, WebP).`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newUploaded.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        previewUrl,
        file,
      });
    });

    setImages((prev) => [...prev, ...newUploaded]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Helper date buttons
  const setQuickTime = (type: "now" | "today" | "yesterday") => {
    const d = new Date();
    if (type === "yesterday") {
      d.setDate(d.getDate() - 1);
    }
    setDateTime(d.toISOString().slice(0, 16));
  };

  // Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) {
      errors.title = "Please enter an item title or headline.";
    } else if (title.trim().length < 3) {
      errors.title = "Item title must be at least 3 characters.";
    }

    if (!description.trim()) {
      errors.description = "Please provide a detailed description to assist multimodal matching.";
    } else if (description.trim().length < 15) {
      errors.description = "Description should be at least 15 characters for accurate S-BERT embeddings.";
    }

    if (!specificLocation.trim()) {
      errors.specificLocation = "Please specify a room, desk, landmark, or specific spot.";
    }

    if (!reporterName.trim()) {
      errors.reporterName = "Please provide your name.";
    }

    if (!contactEmail.trim()) {
      errors.contactEmail = "Please provide your contact email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.contactEmail = "Please enter a valid email address.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        const el = document.getElementById(firstError);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    // Realistic simulation of Multimodal AI steps for Day 1
    setSubmissionStep("Validating multimodal payload...");
    await new Promise((r) => setTimeout(r, 400));

    if (images.length > 0) {
      setSubmissionStep("Preparing OpenCLIP vision tensor (512-dim embedding)...");
      await new Promise((r) => setTimeout(r, 600));
    } else {
      setSubmissionStep("Image omitted: Switching to text-only semantic weighting...");
      await new Promise((r) => setTimeout(r, 500));
    }

    setSubmissionStep("Generating Sentence Transformers (all-MiniLM-L6-v2) embedding...");
    await new Promise((r) => setTimeout(r, 500));

    setSubmissionStep("Assigning campus spatiotemporal coordinates & indexing...");
    await new Promise((r) => setTimeout(r, 400));

    const newReport: StoredItemReport = {
      id: `FIND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      reportType,
      title: title.trim(),
      category,
      brand: brand.trim(),
      primaryColor,
      secondaryColor,
      campusLocation,
      specificLocation: specificLocation.trim(),
      dateTime: dateTime || new Date().toISOString().slice(0, 16),
      description: description.trim(),
      uniqueMarks: uniqueMarks.trim(),
      secretVerificationHint: secretVerificationHint.trim(),
      reporterName: reporterName.trim(),
      studentId: studentId.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      images,
      createdAt: new Date().toISOString(),
      status: "open",
    };

    setIsSubmitting(false);
    setSubmittedReport(newReport);

    if (onReportCreated) {
      onReportCreated(newReport);
    }
  };

  const resetForm = () => {
    setSubmittedReport(null);
    setTitle("");
    setBrand("");
    setSpecificLocation("");
    setDescription("");
    setUniqueMarks("");
    setSecretVerificationHint("");
    setImages([]);
    setFormErrors({});
  };

  // Theme accents depending on Lost vs Found
  const isLost = reportType === "lost";
  const theme = {
    badge: isLost ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-emerald-100 text-emerald-800 border-emerald-200",
    gradientHeader: isLost
      ? "from-rose-600 via-rose-500 to-amber-500"
      : "from-emerald-600 via-teal-600 to-cyan-600",
    ringFocus: isLost ? "focus:ring-rose-500 focus:border-rose-500" : "focus:ring-emerald-500 focus:border-emerald-500",
    buttonPrimary: isLost
      ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-200"
      : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-200",
  };

  return (
    <div id="report-form" className="w-full max-w-4xl mx-auto">
      {/* Success Modal / Receipt */}
      {submittedReport && (
        <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white border-2 border-emerald-500 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Report Registered Successfully
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {submittedReport.reportType === "lost" ? "Lost Item Report" : "Found Item Report"} #{submittedReport.id}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">System Tracking Code</span>
                  <span className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {submittedReport.id}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Item Title</span>
                  <p className="font-semibold text-slate-800">{submittedReport.title}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Category</span>
                  <p className="font-semibold text-slate-800 capitalize">
                    {submittedReport.category.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Campus Location</span>
                  <p className="font-semibold text-slate-800">
                    {CAMPUS_LOCATIONS.find((l) => l.id === submittedReport.campusLocation)?.name ||
                      submittedReport.campusLocation}
                  </p>
                </div>
              </div>

              {/* Multimodal embeddings preview */}
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">AI Multimodal Pipeline Status:</span>
                  <p className="mt-0.5 text-indigo-800">
                    {submittedReport.images.length > 0
                      ? `Successfully extracted OpenCLIP 512-dim visual embeddings from ${submittedReport.images.length} photo(s) & Sentence Transformer tokens from description.`
                      : "No photos provided. Activated zero-shot text-only semantic matching pipeline (re-weighted to text description + attributes)."}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Submit Another Report
                </button>
                <a
                  href="#recent-items"
                  className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition inline-flex items-center gap-1.5"
                >
                  View Campus Feed
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Form Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Banner with Lost vs Found Toggle */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${theme.gradientHeader} text-white transition-colors duration-300`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                Multimodal Campus Intake
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
                {isLost ? "Report a Lost Item" : "Report a Found Item"}
              </h2>
              <p className="text-sm text-white/90 mt-1 max-w-xl">
                {isLost
                  ? "Describe what you lost. Our multimodal AI compares your photos and descriptions against all found campus items."
                  : "Found something on campus? Register it here to help the rightful owner find and safely claim it."}
              </p>
            </div>

            {/* Type Switcher Buttons */}
            <div className="bg-black/20 p-1.5 rounded-2xl backdrop-blur-md flex items-center border border-white/20 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setReportType("lost")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isLost
                    ? "bg-white text-rose-700 shadow-md scale-102"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                🔍 I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setReportType("found")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  !isLost
                    ? "bg-white text-emerald-700 shadow-md scale-102"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                🎁 I Found Something
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Item Basic Info */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-200">
              <Tag className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                1. Item Classification & Basic Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Item Title */}
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Item Title / Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isLost
                      ? "e.g., Space Grey MacBook Air M2 with astronaut sticker"
                      : "e.g., Set of keys with blue Subaru fob and gym tag"
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.title ? "border-rose-400 bg-rose-50/30" : "border-slate-300 bg-white"
                  } text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand / Model */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Apple, Dell, Nike, Hydro Flask, Sony"
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Color
                </label>
                <select
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                >
                  {COMMON_COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Secondary / Accent Color
                </label>
                <select
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                >
                  <option value="None">None / Single Tone</option>
                  {COMMON_COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Multimodal Image Upload */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  2. Visual Image Upload (OpenCLIP Matching)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Up to 4 images (5MB max each)</span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-indigo-600 bg-indigo-50/60 scale-[1.01]"
                  : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-indigo-600">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="text-indigo-600 underline">Click to upload photos</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, and WebP (up to 5MB each)
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Uploaded Images ({images.length}/4):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                    >
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="w-full h-28 object-cover group-hover:scale-105 transition duration-200"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1.5 bg-white border-t border-slate-100 text-[10px] text-slate-600 truncate">
                        {img.name} ({(img.size / 1024).toFixed(0)} KB)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explainable AI Notice for Missing Images */}
            <div className="mt-3 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                <strong>Multimodal AI Notice:</strong> Don&apos;t have a photo? No problem! The system will dynamically distribute visual weight to your semantic text description and categorical tags (Feature #8: Text-only matching fallback).
              </p>
            </div>
          </div>

          {/* Section 3: Spatiotemporal Details */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-200">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                3. Campus Location & Time Proximity
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Campus Building / Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Area / Building <span className="text-rose-500">*</span>
                </label>
                <select
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Exact Spot / Landmark */}
              <div>
                <label htmlFor="specificLocation" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Exact Spot / Landmark / Room <span className="text-rose-500">*</span>
                </label>
                <input
                  id="specificLocation"
                  type="text"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  placeholder="e.g., 2nd Floor Quiet Study, Desk 24 or Cafeteria Booth"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.specificLocation ? "border-rose-400 bg-rose-50/30" : "border-slate-300 bg-white"
                  } text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
                {formErrors.specificLocation && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.specificLocation}
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {isLost ? "Date & Time Last Seen" : "Date & Time Found"} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickTime("now")}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime("today")}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime("yesterday")}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Yesterday
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Detailed Description & Verification Attributes */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-200">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                4. Semantic Description & Explainable Attributes
              </h3>
            </div>

            <div className="space-y-4">
              {/* Detailed Description */}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Semantic Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item in natural language. Mention materials, size, condition, contents, or any context. (Sentence Transformers will vectorize this text for semantic matching)."
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.description ? "border-rose-400 bg-rose-50/30" : "border-slate-300 bg-white"
                  } text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Unique Marks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Distinguishing Features & Marks
                </label>
                <input
                  type="text"
                  value={uniqueMarks}
                  onChange={(e) => setUniqueMarks(e.target.value)}
                  placeholder="e.g., Scratch on bottom-left, GitHub sticker on lid, broken zipper pull"
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
              </div>

              {/* Secret Verification Hint */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Secret Verification Detail (Admin Anti-Fraud Safeguard)
                  </label>
                </div>
                <p className="text-xs text-indigo-700/90 mb-2">
                  {isLost
                    ? "Provide a private detail only the true owner would know (e.g. lock screen photo, interior pocket contents, engraving initials)."
                    : "If the found item contains hidden details (e.g., specific student name card, distinct keychain), note what a claimer must identify."}
                </p>
                <input
                  type="text"
                  value={secretVerificationHint}
                  onChange={(e) => setSecretVerificationHint(e.target.value)}
                  placeholder="e.g., Phone wallpaper is a golden retriever named Max; 3 silver coins in front pocket"
                  className={`w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Submitter Contact Information */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-200">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                5. Reporter Contact & Verification
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="reporterName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reporterName"
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.reporterName ? "border-rose-400 bg-rose-50/30" : "border-slate-300 bg-white"
                  } text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
                {formErrors.reporterName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.reporterName}
                  </p>
                )}
              </div>

              {/* Student / Staff ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  University Student / Staff ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g., U-2024-8192"
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="contactEmail" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Campus / Personal Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="alex.johnson@university.edu"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.contactEmail ? "border-rose-400 bg-rose-50/30" : "border-slate-300 bg-white"
                  } text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
                {formErrors.contactEmail && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.contactEmail}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                />
              </div>

              {/* Privacy consent checkbox */}
              <div className="sm:col-span-2 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPrivacy}
                    onChange={(e) => setConsentPrivacy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I understand that submitted data will be processed by the campus multimodal matching system and stored in the secure university repository. Contact details remain confidential until an administrator validates a genuine match.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Initial match weights: 0.40 Img, 0.25 Txt, 0.15 Loc, 0.10 Time, 0.10 Attr</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !consentPrivacy}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonPrimary}`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{submissionStep || "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <span>Submit {isLost ? "Lost" : "Found"} Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
