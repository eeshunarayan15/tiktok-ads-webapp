// src/services/validation.ts

import type { AdFormData, FormErrors } from "../types/tiktok";
import { VALIDATION_RULES, VALIDATION_ERRORS } from "../utils/constants";

/**
 * Validates the entire ad creation form
 */
export function validateAdForm(formData: AdFormData): FormErrors {
  const errors: FormErrors = {};

  // Campaign name validation
  if (!formData.campaignName.trim()) {
    errors.campaignName = VALIDATION_ERRORS.campaignName.required;
  } else if (
    formData.campaignName.length < VALIDATION_RULES.campaignName.minLength
  ) {
    errors.campaignName = VALIDATION_ERRORS.campaignName.minLength;
  } else if (
    formData.campaignName.length > VALIDATION_RULES.campaignName.maxLength
  ) {
    errors.campaignName = VALIDATION_ERRORS.campaignName.maxLength;
  }

  // Objective validation
  if (!formData.objective) {
    errors.objective = VALIDATION_ERRORS.objective.required;
  }

  // Ad text validation
  if (!formData.adText.trim()) {
    errors.adText = VALIDATION_ERRORS.adText.required;
  } else if (formData.adText.length > VALIDATION_RULES.adText.maxLength) {
    errors.adText = VALIDATION_ERRORS.adText.maxLength;
  }

  // CTA validation
  if (!formData.cta) {
    errors.cta = VALIDATION_ERRORS.cta.required;
  }

  // Music option validation
  if (!formData.musicOption) {
    errors.musicOption = VALIDATION_ERRORS.musicOption.required;
  }

  // Conditional music validation based on objective
  if (formData.objective === "CONVERSIONS" && formData.musicOption === "none") {
    errors.musicOption = VALIDATION_ERRORS.musicOption.invalidForObjective;
  }

  // Music ID validation (when using existing music)
  if (formData.musicOption === "existing") {
    if (!formData.musicId.trim()) {
      errors.musicId = VALIDATION_ERRORS.musicId.required;
    } else if (!VALIDATION_RULES.musicId.pattern.test(formData.musicId)) {
      errors.musicId = VALIDATION_ERRORS.musicId.invalid;
    }
  }

  // File upload validation (when uploading custom music)
  if (formData.musicOption === "upload") {
    if (!formData.uploadedMusicFile) {
      errors.uploadedMusicFile = VALIDATION_ERRORS.uploadedMusicFile.required;
    } else {
      const file = formData.uploadedMusicFile;
      const validTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp4",
        "audio/x-m4a",
      ];

      if (!validTypes.includes(file.type)) {
        errors.uploadedMusicFile =
          VALIDATION_ERRORS.uploadedMusicFile.invalidType;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        errors.uploadedMusicFile = VALIDATION_ERRORS.uploadedMusicFile.tooLarge;
      }
    }
  }

  return errors;
}

/**
 * Validates a single field
 */
export function validateField(
  fieldName: keyof AdFormData,
  value: string | File | undefined,
  formData: AdFormData,
): string | undefined {
  const singleFieldData = { ...formData, [fieldName]: value };
  const errors = validateAdForm(singleFieldData);
  return errors[fieldName];
}

/**
 * Checks if form has any errors
 */
export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
