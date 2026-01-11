import { db } from "../db/mediaDB";

export function loadCachedFolders(): Map<string, any> {
  const folders = new Map<string, any>();

  const rows = db.getAllSync(`
    SELECT * FROM videos
  `);

  for (const v of rows as any[]) {
    let folder = folders.get(v.folderPath);
    if (!folder) {
      folder = {
        folderName: v.folderName,
        folderPath: v.folderPath,
        videos: [],
      };
      folders.set(v.folderPath, folder);
    }

    folder.videos.push(v);
  }

  return folders;
}
