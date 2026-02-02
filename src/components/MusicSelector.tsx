import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import type {
  MusicOption,
  CampaignObjective,
  FormErrors,
} from "../types/tiktok";
import { MUSIC_OPTIONS } from "../utils/constants";
import { FormField } from "./FormField";
import { validateMusicId, uploadCustomMusic } from "../store/action/musicAction";

interface MusicSelectorProps {
  musicOption: MusicOption;
  musicId?: string;
  uploadedFile?: File | null;
  objective: CampaignObjective;
  errors: FormErrors;
  onChange: (field: string, value: any) => void;
}

export function MusicSelector({
                                musicOption,
                                musicId,
                                uploadedFile,
                                objective,
                                errors,
                                onChange,
                              }: MusicSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const { validating, validMusicId, musicDetails, error: validationError } = useSelector(
      (state: RootState) => state.music
  );

  const [uploadingMusic, setUploadingMusic] = useState(false);

  useEffect(() => {
    if (musicOption === "existing" && musicId && accessToken) {
      const timer = setTimeout(() => {
        handleValidateMusicId();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [musicId, musicOption, accessToken, dispatch]);

  const handleValidateMusicId = async () => {
    if (!musicId || !accessToken) return;
    dispatch(validateMusicId(musicId));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    onChange("uploadedMusicFile", file);
    setUploadingMusic(true);

    try {
      // Upload generates Music ID
      const generatedMusicId = await dispatch(uploadCustomMusic());
      onChange("musicId", generatedMusicId);

      // 🎯 FIX: Validate the uploaded Music ID
      dispatch(validateMusicId(generatedMusicId));

    } catch (error) {
      // Error handled by Redux state
    } finally {
      setUploadingMusic(false);
    }
  };

  const isNoneDisabled = objective === "CONVERSIONS";

  return (
      <div className="space-y-4">
        <FormField
            label="Music Selection"
            required
            error={errors.musicOption}
            description={
              isNoneDisabled
                  ? "⚠️ Music is required for Conversions campaigns"
                  : undefined
            }
        >
          <div className="space-y-3">
            {MUSIC_OPTIONS.map((option) => {
              const disabled = option.value === "none" && isNoneDisabled;

              return (
                  <label
                      key={option.value}
                      className={`relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          disabled
                              ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                              : musicOption === option.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <input
                        type="radio"
                        name="musicOption"
                        value={option.value}
                        checked={musicOption === option.value}
                        onChange={(e) => onChange("musicOption", e.target.value)}
                        disabled={disabled}
                        className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {option.description}
                      </div>
                      {disabled && (
                          <div className="text-xs text-red-600 mt-1 font-medium">
                            Not available for Conversions campaigns
                          </div>
                      )}
                    </div>
                  </label>
              );
            })}
          </div>
        </FormField>

        {/* Existing Music ID Input */}
        {musicOption === "existing" && (
            <FormField
                label="Music ID"
                required
                error={errors.musicId || validationError || undefined}
            >
              <div className="relative">
                <input
                    type="text"
                    value={musicId}
                    onChange={(e) => onChange("musicId", e.target.value)}
                    placeholder="Enter 10-20 digit music ID"
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        validationError
                            ? "border-red-300 bg-red-50"
                            : validMusicId === musicId
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200"
                    }`}
                />

                {validating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
              </div>

              {validMusicId === musicId && musicDetails && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    ✓ "{musicDetails.title}" by {musicDetails.artist}
                  </p>
              )}

              {validationError && (
                  <p className="text-sm text-red-600 mt-1">
                    ✗ {validationError}
                  </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                💡 Example valid IDs: 1234567890123456
              </p>
            </FormField>
        )}

        {/* Music File Upload */}
        {musicOption === "upload" && (
            <FormField
                label="Upload Music File"
                required
                error={errors.uploadedMusicFile}
            >
              <div className="relative">
                <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
                    onChange={handleFileUpload}
                    disabled={uploadingMusic || validating}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />

                {(uploadingMusic || validating) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
              </div>

              {uploadedFile && !uploadingMusic && !validating && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
              )}

              {/* 🎯 Show validation status for upload */}
              {musicOption === "upload" && validMusicId === musicId && musicDetails && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Uploaded music validated successfully
                  </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: MP3, WAV, M4A (Max 10MB)
              </p>
            </FormField>
        )}

        {/* No Music */}
        {musicOption === "none" && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                ℹ️ Your ad will be created without background music.
              </p>
            </div>
        )}
      </div>
  );
}