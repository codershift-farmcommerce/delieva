export function downloadFile(data: Blob, name: string) {
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.style.display = 'none'
  document.body.appendChild(a)
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)
}
