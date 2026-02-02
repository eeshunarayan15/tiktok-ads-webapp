import React, { useEffect } from "react";

// REMOVED: import { useAuth } from "../contexts/AuthContext";
// ADDED: Redux imports
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { updateAdField, createAd, resetAdForm } from "../store/action/adAction";

// import type { FormErrors } from "../types/tiktok";
import { FormField } from "./FormField";
import { MusicSelector } from "./MusicSelector";
// REMOVED: ErrorBanner import - using toast instead
import { CTA_OPTIONS, OBJECTIVE_OPTIONS } from "../utils/constants";
import toast from "react-hot-toast"; // ADDED: For notifications

export function AdCreationForm() {
  // CHANGED: Get dispatch and state from Redux
  const dispatch = useDispatch<AppDispatch>();

  // Get all form state from Redux
  const {
    formData,
    loading: submitting,  // renamed to match existing variable
    validationErrors: errors, // renamed to match existing variable
    success,
    createdAdId
  } = useSelector((state: RootState) => state.ad);

  // Get auth status (to check if token expired during submission)
  const { accessToken } = useSelector((state: RootState) => state.auth);

  // CHANGED: Handle field changes via Redux
  const handleChange = (field: string, value: any) => {
    dispatch(updateAdField(field as keyof typeof formData, value));
  };

  // CHANGED: Handle form submission via Redux
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if still authenticated
    if (!accessToken) {
      toast.error("Session expired. Please reconnect your TikTok account.", {
        duration: 5000,
        icon: "🔒",
      });
      return;
    }

    // Dispatch create ad action
    dispatch(createAd());
  };

  // NEW: Watch for success and reset form automatically
  useEffect(() => {
    if (success) {
      // Auto-reset form after 5 seconds (toast is handled by action)
      const timer = setTimeout(() => {
        dispatch(resetAdForm());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const adTextLength = formData.adText.length;
  const adTextMaxLength = 100;

  // Show success state
  if (success) {
    return (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-green-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-green-900">
                  Ad Created Successfully!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Your TikTok ad has been submitted and is being reviewed.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Ad ID: {createdAdId}
                </p>
              </div>
            </div>

            <button
                onClick={() => dispatch(resetAdForm())}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Another Ad
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-2xl mx-auto">
        {/* Form */}
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create TikTok Ad</h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill in the details below to create your ad campaign
            </p>
          </div>

          {/* Campaign Name */}
          <FormField label="Campaign Name" required error={errors.campaignName}>
            <input
                type="text"
                value={formData.campaignName}
                onChange={(e) => handleChange("campaignName", e.target.value)}
                placeholder="e.g., Summer Sale 2024"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </FormField>

          {/* Campaign Objective */}
          <FormField label="Campaign Objective" required error={errors.objective}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OBJECTIVE_OPTIONS.map((option) => (
                  <label
                      key={option.value}
                      className={`relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.objective === option.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <input
                        type="radio"
                        name="objective"
                        value={option.value}
                        checked={formData.objective === option.value}
                        onChange={(e) => handleChange("objective", e.target.value)}
                        className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </label>
              ))}
            </div>
          </FormField>

          {/* Ad Text */}
          <FormField label="Ad Text" required error={errors.adText}>
            <div className="relative">
            <textarea
                value={formData.adText}
                onChange={(e) => handleChange("adText", e.target.value)}
                placeholder="Write compelling ad copy that captures attention..."
                rows={4}
                maxLength={adTextMaxLength}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
              <div
                  className={`absolute bottom-3 right-3 text-xs ${
                      adTextLength > 90 ? "text-orange-500" : "text-gray-400"
                  }`}
              >
                {adTextLength}/{adTextMaxLength}
              </div>
            </div>
          </FormField>

          {/* Call to Action */}
          <FormField label="Call to Action" required error={errors.cta}>
            <select
                value={formData.cta}
                onChange={(e) => handleChange("cta", e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            >
              {CTA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
              ))}
            </select>
          </FormField>

          {/* Music Selector - Now uses Redux internally */}
          <MusicSelector
              musicOption={formData.musicOption}
              musicId={formData.musicId}
              uploadedFile={formData.uploadedMusicFile}
              objective={formData.objective}
              errors={errors}
              onChange={handleChange}
          />

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Ad...
                  </>
              ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Ad
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
  );
}