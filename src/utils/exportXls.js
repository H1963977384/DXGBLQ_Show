import * as XLSX from 'xlsx-js-style'

const INVALID_SHEET_CHARS = /[\\/?*\[\]:]/g

const normalizeSheetName = (name) => {
  const base = String(name || 'Sheet1').replace(INVALID_SHEET_CHARS, '').trim() || 'Sheet1'
  return base.slice(0, 31)
}

const applyStyleRanges = (worksheet, styleRanges = []) => {
  styleRanges.forEach((range) => {
    if (!range?.s || !range?.e || !range?.style) {
      return
    }

    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: col })
        if (!worksheet[address]) {
          worksheet[address] = { t: 's', v: '' }
        }
        worksheet[address].s = range.style
      }
    }
  })
}

export const exportToXls = ({ fileName, sheetName, columns, data, rows, merges, columnWidths, styleRanges, rowHeights }) => {
  const safeColumns = Array.isArray(columns) ? columns : []
  const safeData = Array.isArray(data) ? data : []
  const exportRows = rows

  const worksheet = Array.isArray(exportRows) && exportRows.length
    ? XLSX.utils.aoa_to_sheet(exportRows)
    : XLSX.utils.json_to_sheet(
      safeData.map((row) => {
        const mapped = {}
        safeColumns.forEach((column) => {
          const key = column.label || ''
          if (!key) {
            return
          }
          if (typeof column.value === 'function') {
            mapped[key] = column.value(row)
          } else {
            mapped[key] = row?.[column.value]
          }
        })
        return mapped
      })
    )

  if (Array.isArray(merges) && merges.length) {
    worksheet['!merges'] = merges
  }

  if (Array.isArray(columnWidths) && columnWidths.length) {
    worksheet['!cols'] = columnWidths
  }

  if (Array.isArray(rowHeights) && rowHeights.length) {
    worksheet['!rows'] = rowHeights
  }

  if (Array.isArray(styleRanges) && styleRanges.length) {
    applyStyleRanges(worksheet, styleRanges)
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, normalizeSheetName(sheetName))

  const safeFileName = String(fileName || 'export').trim() || 'export'
  const hasStyles = Array.isArray(styleRanges) && styleRanges.length > 0
  XLSX.writeFile(workbook, `${safeFileName}.${hasStyles ? 'xlsx' : 'xls'}`, { bookType: hasStyles ? 'xlsx' : 'biff8' })
}
