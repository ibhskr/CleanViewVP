import { create } from "zustand";
import { initMediaDB } from "../db/mediaDB";
import { loadCachedFolders } from "../services/mediaCache";
import { incrementalScan } from "../services/mediaScanner";

export const useMediaStore = create<any>((set) => ({
  folders: [],
  hydrated: false,
  scanning: false,

  loadMedia: async () => {
    initMediaDB();

    // STEP 1: Load cache
    const foldersMap = loadCachedFolders();
    set({
      folders: Array.from(foldersMap.values()),
      hydrated: true,
    });

    // STEP 2: Background scan
    set({ scanning: true });

    await incrementalScan(foldersMap, (updated) => {
      set({ folders: updated });
    });

    set({ scanning: false });
  },
}));
