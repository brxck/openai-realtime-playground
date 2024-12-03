import { CustomCell, SortedTableInHtmlTable } from 'tinybase/ui-react-dom';

import { ReactStore, tablesSchema } from '@/store';
import { useCell, useSetPartialRowCallback } from 'tinybase/ui-react';
import { useEffect, useRef } from 'react';

export function Data() {
  const tables = ReactStore.useTableIds();

  return (
    <div>
      {tables.map((tableId) => {
        const cells = Object.keys(tablesSchema[tableId]).reduce(
          (acc, cellId) => {
            if (cellId === 'accessed' || cellId === 'modified') return acc;
            acc[cellId] = { component: HighlightedCell, label: cellId };
            return acc;
          },
          {} as Record<string, CustomCell>
        );
        return (
          <SortedTableInHtmlTable
            key={tableId}
            tableId={tableId}
            sortOnClick={true}
            className="w-full p-4 table-auto tinybase-table"
            idColumn={false}
            customCells={cells}
          />
        );
      })}
    </div>
  );
}

const HighlightedCell: CustomCell['component'] = ({
  tableId,
  rowId,
  cellId,
  store,
}) => {
  const value = useCell(tableId, rowId, cellId, store);
  const ref = useRef<HTMLDivElement>(null);

  const accessed = useCell(tableId, rowId, 'accessed', store);
  const lastAccessed = useRef(accessed);
  const modified = useCell(tableId, rowId, 'modified', store);
  const lastModified = useRef(modified);

  // Highlight rows as they are accessed, then fade back to white
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!ref.current) return;

    let event;
    if (modified !== lastModified.current) {
      event = 'modified';
    } else if (accessed !== lastAccessed.current) {
      event = 'accessed';
    } else {
      return;
    }

    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    ref.current.style.transitionDuration = 'unset';
    ref.current.style.backgroundColor =
      event === 'modified' ? 'rgb(59 130 246 / 0.5)' : 'rgb(34 197 94 / 0.5)';

    fadeTimeoutRef.current = setTimeout(() => {
      if (!ref.current) return;
      ref.current.style.transitionDuration = '3s';
      ref.current.style.backgroundColor = 'white';
    }, 100);

    lastAccessed.current = accessed;
    lastModified.current = modified;

    return () => {
      fadeTimeoutRef.current && clearTimeout(fadeTimeoutRef.current);
    };
  }, [accessed, modified]);

  return (
    <div
      ref={ref}
      className="transition-colors"
      onClick={useSetPartialRowCallback(tableId, rowId, () => ({
        modified: new Date().toISOString(),
      }))}
    >
      {value}
    </div>
  );
};
