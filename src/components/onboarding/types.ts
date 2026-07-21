import type { Tables } from "@/types/database";

export type CabinetOnboardingData = {
  profile: Tables<"profiles">;
  cabinet: Tables<"cabinet_profiles"> | null;
  specialtyCodes: string[];
  equipmentCodes: string[];
  photos: Tables<"cabinet_photos">[];
  documents: Tables<"documents">[];
  preferences: Tables<"user_preferences"> | null;
};

export type ReplacementOnboardingData = {
  profile: Tables<"profiles">;
  replacement: Tables<"replacement_profiles"> | null;
  specialtyCodes: string[];
  documents: Tables<"documents">[];
  availabilities: Tables<"availabilities">[];
  mobilityAreas: Tables<"mobility_areas">[];
  preferences: Tables<"user_preferences"> | null;
};
