/** The server/build discovers files. Adding a location never needs a registry edit. */
export async function loadLocations() {
  const response = await fetch(new URL('./locations/manifest.json', import.meta.url));
  if (!response.ok) throw new Error('Не удалось загрузить список локаций');
  const files = await response.json();
  const locations = await Promise.all(files.map(async file => {
    const { default: location } = await import(new URL(`./locations/${file}`, import.meta.url));
    if (!location?.id || !location?.title) throw new Error(`Неверная локация: ${file}`);
    return location;
  }));
  if (!locations.some(item => item.id === 'room') || new Set(locations.map(item => item.id)).size !== locations.length) throw new Error('Локация room отсутствует или ID повторяются');
  return locations.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
}
