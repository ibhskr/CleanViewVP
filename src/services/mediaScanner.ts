import * as MediaLibrary from "expo-media-library";
import { db } from "../db/mediaDB";
// import * as MediaLibrary from "expo-media-library";

export async function requestMediaPermission() {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}
export async function incrementalScan(
  foldersMap: Map<string, any>,
  updateUI: (folders: any[]) => void
) {
  let after: string | undefined;
  let hasNext = true;

  while (hasNext) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: "video",
      first: 50, // Smaller batches feel more responsive
      after,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    let batchChanged = false;

    // Start a transaction for the current batch
    db.withTransactionSync(() => {
      for (const asset of result.assets) {
        // 1. Efficient check
        const existing = db.getFirstSync<{ modified: number }>(
          `SELECT modified FROM videos WHERE id = ?`,
          [asset.id]
        );

        if (existing && existing.modified === asset.modificationTime) {
          continue;
        }

        batchChanged = true;

        // 2. Logic for Folder Names
        // On modern Android/iOS, uri might be a content:// provider. 
        // asset.filename is safer for determining names.
        const uri = asset.uri;
        // Fallback for folder path logic
        const folderPath = uri.substring(0, uri.lastIndexOf("/")) || "Internal";
        const folderName = asset.albumId || "Videos"; 

        // 3. Optimized Write
        db.runSync(
          `INSERT OR REPLACE INTO videos 
           (id, uri, filename, folderPath, folderName, duration, size, modified) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            asset.id,
            uri,
            asset.filename,
            folderPath,
            folderName,
            asset.duration,
            asset.fileSize,
            asset.modificationTime,
          ]
        );

        // 4. Update the local Map
        let folder = foldersMap.get(folderPath);
        if (!folder) {
          folder = { folderName, folderPath, videos: [] };
          foldersMap.set(folderPath, folder);
        }

        // Avoid duplicate entries in the same session
        const existsInMap = folder.videos.some((v: any) => v.id === asset.id);
        if (!existsInMap) {
          folder.videos.push({
            id: asset.id,
            uri,
            filename: asset.filename,
            duration: asset.duration,
            size: asset.fileSize,
            folderPath,
            folderName,
          });
        }
      }
    });

    // 5. Stream Updates: Update UI immediately after each batch
    if (batchChanged) {
      updateUI(Array.from(foldersMap.values()));
    }

    after = result.endCursor;
    hasNext = result.hasNextPage;
  }
}