import { CustomCell, SortedTableInHtmlTable } from 'tinybase/ui-react-dom';

import { ReactStore, tablesSchema } from '@/store';
import { useCell, useSetPartialRowCallback } from 'tinybase/ui-react';
import { useEffect, useRef } from 'react';

export function Data() {
  const tables = ReactStore.useTableIds();

  return (
    <div className="text-sm">
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
          <div className="mx-4 my-2">
            <div className="p-2 font-bold capitalize">{tableId}</div>
            <div className="border rounded-md">
              <div className="overflow-hidden rounded-md">
                <SortedTableInHtmlTable
                  key={tableId}
                  tableId={tableId}
                  sortOnClick={true}
                  className="w-full p-4 table-auto tinybase-table"
                  idColumn={false}
                  customCells={cells}
                />
              </div>
            </div>
          </div>
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

    const parentTr = ref.current.parentElement?.parentElement;
    if (!parentTr) return;
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);

    parentTr.style.transitionDuration = 'unset';
    parentTr.style.backgroundColor =
      event === 'modified' ? 'rgb(59 130 246 / 0.5)' : 'rgb(34 197 94 / 0.5)';

    fadeTimeoutRef.current = setTimeout(() => {
      if (!parentTr) return;
      parentTr.style.transitionDuration = '3s';
      parentTr.style.backgroundColor = 'white';
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
