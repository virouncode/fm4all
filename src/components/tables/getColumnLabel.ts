export function getColumnLabel(
  columnId: string,
  idLabelMap: Map<string, string>
) {
  return idLabelMap.get(columnId) || columnId;
}
