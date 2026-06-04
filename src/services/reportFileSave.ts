import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';

const DOWNLOAD_SAF_URI_KEY = 'report_download_saf_directory_uri';

export type SavedReport = {
  fileName: string;
  mimeType: string;
  /** Локальный URI для просмотра (file:// или blob: на web). */
  fileUri: string;
  savedToDownloads: boolean;
};

export function assertPdfBytes(bytes: Uint8Array) {
  if (bytes.length < 4) {
    throw new Error('Сервер вернул пустой ответ вместо PDF');
  }
  const isPdf =
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (isPdf) return;

  const text = new TextDecoder().decode(bytes.slice(0, 400));
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const json = JSON.parse(trimmed) as { message?: string; error?: string };
      throw new Error(json.message || json.error || 'Сервер вернул ошибку вместо PDF');
    } catch (error) {
      if (error instanceof Error && !error.message.startsWith('Unexpected')) {
        throw error;
      }
    }
  }
  throw new Error(
    trimmed.startsWith('<')
      ? 'Сервер вернул HTML вместо PDF. Проверьте analytics-service.'
      : 'Файл не является PDF или повреждён',
  );
}

function arrayBufferToBase64(payload: ArrayBuffer): string {
  const bytes = new Uint8Array(payload);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof globalThis.btoa !== 'function') {
    throw new Error('Не удалось подготовить файл отчёта');
  }
  return globalThis.btoa(binary);
}

function stripExtension(fileName: string) {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

function getNativeCacheDirectory() {
  const directory = LegacyFileSystem.cacheDirectory ?? LegacyFileSystem.documentDirectory;
  if (!directory) {
    throw new Error('Нет доступа к памяти приложения для сохранения отчёта');
  }
  return directory;
}

async function writeBinaryFile(fileUri: string, payload: ArrayBuffer) {
  await LegacyFileSystem.writeAsStringAsync(fileUri, arrayBufferToBase64(payload), {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });
}

async function getAndroidDownloadDirectoryUri(): Promise<string> {
  const saved = await AsyncStorage.getItem(DOWNLOAD_SAF_URI_KEY);
  if (saved) return saved;

  const downloadRoot = LegacyFileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download');
  const permissions =
    await LegacyFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(downloadRoot);

  if (!permissions.granted || !permissions.directoryUri) {
    throw new Error('Нужен доступ к папке «Загрузки»');
  }

  await AsyncStorage.setItem(DOWNLOAD_SAF_URI_KEY, permissions.directoryUri);
  return permissions.directoryUri;
}

async function trySaveToAndroidDownloads(
  payload: ArrayBuffer,
  fileName: string,
  mimeType: string,
): Promise<boolean> {
  try {
    const directoryUri = await getAndroidDownloadDirectoryUri();
    const baseName = `${stripExtension(fileName)}_${Date.now()}`;
    const destUri = await LegacyFileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      baseName,
      mimeType,
    );
    await LegacyFileSystem.StorageAccessFramework.writeAsStringAsync(
      destUri,
      arrayBufferToBase64(payload),
      { encoding: LegacyFileSystem.EncodingType.Base64 },
    );
    return true;
  } catch {
    return false;
  }
}

function saveOnWeb(payload: ArrayBuffer, fileName: string, mimeType: string): SavedReport {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('Скачивание в браузере недоступно');
  }
  assertPdfBytes(new Uint8Array(payload));
  const blob = new Blob([payload], { type: mimeType });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return {
    fileName,
    mimeType,
    fileUri: blobUrl,
    savedToDownloads: true,
  };
}

/** Нативное скачивание PDF с сервера без порчи бинарных данных. */
export async function downloadReportToDevice(
  url: string,
  headers: Record<string, string>,
  fileName: string,
  mimeType = 'application/pdf',
): Promise<SavedReport> {
  const directory = getNativeCacheDirectory();
  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const fileUri = `${directory}${safeName}`;

  const result = await LegacyFileSystem.downloadAsync(url, fileUri, { headers });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Ошибка сервера (${result.status}) при генерации отчёта`);
  }

  const savedFile = new File(result.uri);
  const fullBytes = savedFile.bytesSync();
  assertPdfBytes(fullBytes.subarray(0, Math.min(512, fullBytes.length)));

  const savedToDownloads =
    Platform.OS === 'android'
      ? await trySaveToAndroidDownloads(
          fullBytes.buffer.slice(
            fullBytes.byteOffset,
            fullBytes.byteOffset + fullBytes.byteLength,
          ),
          safeName,
          mimeType,
        )
      : false;

  return {
    fileName: safeName,
    mimeType,
    fileUri: result.uri,
    savedToDownloads,
  };
}

/** Сохраняет PDF из ArrayBuffer (web). */
export async function saveReportFile(
  payload: ArrayBuffer,
  fileName: string,
  mimeType: string,
): Promise<SavedReport> {
  if (Platform.OS === 'web') {
    return saveOnWeb(payload, fileName, mimeType);
  }

  assertPdfBytes(new Uint8Array(payload));
  const directory = getNativeCacheDirectory();
  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const fileUri = `${directory}${safeName}`;
  await writeBinaryFile(fileUri, payload);

  const savedToDownloads =
    Platform.OS === 'android' ? await trySaveToAndroidDownloads(payload, safeName, mimeType) : false;

  return {
    fileName: safeName,
    mimeType,
    fileUri,
    savedToDownloads,
  };
}

/** Открывает PDF в просмотрщике (через «Открыть с помощью» / Share). */
export async function openReportPdf(fileUri: string, mimeType = 'application/pdf') {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(fileUri, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: 'Открыть PDF',
      UTI: 'com.adobe.pdf',
    });
    return;
  }

  if (Platform.OS === 'android') {
    const contentUri = await LegacyFileSystem.getContentUriAsync(fileUri);
    await Linking.openURL(contentUri);
    return;
  }

  await Linking.openURL(fileUri);
}
