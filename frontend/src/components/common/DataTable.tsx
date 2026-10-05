import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LucideIcon,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  mobileTitle?: boolean;
  mobileHide?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  pageSize?: number;
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  actions?: (item: T) => React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFilter,
  onRowClick,
  loading = false,
  pageSize = 10,
  emptyState,
  actions,
  title,
  subtitle,
  headerRight,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      if (searchFilter) return searchFilter(item, q);
      return columns.some((col) => {
        const val = (item as any)[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, searchFilter, columns]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    return [...filteredData].sort((a, b) => {
      let valA: any = col?.sortValue ? col.sortValue(a) : (a as any)[sortKey];
      let valB: any = col?.sortValue ? col.sortValue(b) : (b as any)[sortKey];

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const titleColumn = columns.find((c) => c.mobileTitle) || columns[0];

  const EmptyIcon = emptyState?.icon || Inbox;

  return (
    <div className="apple-card border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col min-w-0">
      {/* Top Header / Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          {title && <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-8 pr-8 py-2 rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {headerRight}
        </div>
      </div>

      {/* Desktop & Tablet Table View (hidden on small screens if converted to mobile cards) */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar min-w-0">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 ${col.className || ''} ${col.sortable !== false ? 'cursor-pointer hover:bg-slate-100/80' : ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-slate-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-3 w-3 text-teal-600" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-teal-600" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={`skel-c-${j}`} className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
                    </td>
                  ))}
                  {actions && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-3.5 bg-slate-200 rounded-md w-12 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : pageData.length > 0 ? (
              pageData.map((item) => {
                const key = keyExtractor(item);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-teal-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {columns.map((col) => {
                      const val = (item as any)[col.key];
                      const rendered = col.render ? col.render(item) : val ?? '—';
                      return (
                        <td key={col.key} className={`py-3.5 px-4 align-middle ${col.className || ''}`}>
                          <div className="truncate max-w-xs" title={typeof val === 'string' ? val : undefined}>
                            {rendered}
                          </div>
                        </td>
                      );
                    })}
                    {actions && (
                      <td
                        className="py-3.5 px-4 text-right align-middle shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">{actions(item)}</div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <EmptyIcon className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">{emptyState?.title || 'No Records Found'}</p>
                    <p className="text-[11px] text-slate-500">
                      {searchQuery
                        ? `No results matching "${searchQuery}". Try refining your query.`
                        : emptyState?.description || 'There are no records available in this view.'}
                    </p>
                    {emptyState?.actionLabel && emptyState?.onAction && (
                      <button
                        type="button"
                        onClick={emptyState.onAction}
                        className="mt-2 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors"
                      >
                        {emptyState.actionLabel}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack View (< 768px) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`m-skel-${i}`} className="p-4 space-y-2.5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))
        ) : pageData.length > 0 ? (
          pageData.map((item) => {
            const key = keyExtractor(item);
            const titleVal = titleColumn.render ? titleColumn.render(item) : (item as any)[titleColumn.key];

            return (
              <div
                key={key}
                onClick={() => onRowClick && onRowClick(item)}
                className={`p-4 space-y-2.5 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50 active:bg-slate-100' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900 text-xs truncate min-w-0">
                    {titleVal}
                  </div>
                  {actions && (
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center gap-1.5 min-h-[44px]">
                      {actions(item)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {columns
                    .filter((c) => c.key !== titleColumn.key && !c.mobileHide)
                    .map((col) => {
                      const val = col.render ? col.render(item) : (item as any)[col.key] ?? '—';
                      return (
                        <div key={col.key} className="flex justify-between items-center py-0.5 border-b border-slate-50">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col.header}:</span>
                          <span className="font-medium text-slate-800 text-right truncate ml-2 min-w-0">{val}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center p-4">
            <EmptyIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">{emptyState?.title || 'No Records Found'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {searchQuery ? `No results for "${searchQuery}"` : emptyState?.description || 'No records.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {sortedData.length > 0 && (
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="font-mono text-[11px] text-center sm:text-left">
            Showing <strong className="text-slate-800 font-bold">{Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-slate-800 font-bold">{Math.min(sortedData.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-slate-800 font-bold">{sortedData.length}</strong> records
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 font-mono text-[11px] font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
