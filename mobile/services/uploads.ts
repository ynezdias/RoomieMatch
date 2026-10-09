import { Platform } from 'react-native'
import api from './api'
export async function uploadAsset(asset: any, type = 'image'): Promise<string> {
  const name = asset.fileName || asset.name || 'upload-' + Date.now()
  let file: any = { uri: asset.uri, name, type: asset.mimeType || 'image/jpeg' }
  if (Platform.OS === 'web') file = asset.file || (await (await fetch(asset.uri)).blob())
  if ((file.size || asset.fileSize || asset.size || 0) > 25 * 1024 * 1024)
    throw new Error('Please choose a file smaller than 25 MB.')
  const { data } = await api.post('/upload/sign', { type, filename: name })
  const body = new FormData()
  if (Platform.OS === 'web') body.append('file', file, name)
  else body.append('file', file)
  for (const [key, value] of Object.entries(data.params)) body.append(key, String(value))
  body.append('api_key', data.apiKey)
  body.append('signature', data.signature)
  const resource =
    type === 'image' ? 'image' : type === 'video' || type === 'audio' ? 'video' : 'raw'
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/' + data.cloudName + '/' + resource + '/upload',
    { method: 'POST', body },
  )
  const result = await response.json()
  if (!response.ok || !result.secure_url)
    throw new Error(result.error?.message || 'Upload failed. Please try again.')
  return result.secure_url
}
