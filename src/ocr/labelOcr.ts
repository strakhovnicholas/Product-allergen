import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type OcrResult = { text: string; source: 'mlkit' | 'manual' };

/**
 * On-device text recognition. Requires development build (not Expo Go).
 * Falls back to empty string — UI can offer manual paste.
 */
export async function recognizeLabelText(imageUri: string): Promise<OcrResult> {
  try {
    const prepared = await manipulateAsync(imageUri, [{ resize: { width: 1200 } }], {
      compress: 0.85,
      format: SaveFormat.JPEG,
    });

    const TextRecognition = require('@react-native-ml-kit/text-recognition');
    const result = await TextRecognition.recognize(prepared.uri);
    const text =
      result?.text ??
      (Array.isArray(result?.blocks)
        ? result.blocks.map((b: { text?: string }) => b.text ?? '').join('\n')
        : '');

    return { text: String(text).trim(), source: 'mlkit' };
  } catch (e) {
    console.log('OCR unavailable (use dev build):', e);
    return { text: '', source: 'manual' };
  }
}
