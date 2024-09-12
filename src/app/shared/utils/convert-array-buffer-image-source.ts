export function converterArrayBufferEmImgSrc(
  imgArrayBuffer: ArrayBuffer | null
): string {
  return imgArrayBuffer ? 'data:image/jpeg;base64,' + imgArrayBuffer : '';
}
