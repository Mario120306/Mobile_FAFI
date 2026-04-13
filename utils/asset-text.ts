import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export async function readTextAsset(source: number): Promise<string> {
  const asset = Asset.fromModule(source);

  if (!asset.localUri) {
    await asset.downloadAsync();
  }

  const uri = asset.localUri ?? asset.uri;
  if (!uri) return '';

  return await FileSystem.readAsStringAsync(uri);
}
