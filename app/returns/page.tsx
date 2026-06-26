"use client";

import Link from "next/link";
import { useReturnsList } from "./_hooks/use-returns-list";
import { StatsBar }     from "./_components/stats-bar";
import { SearchBar }    from "./_components/search-bar";
import { ReturnsTable } from "./_components/returns-table";

export default function ReturnsPage() {
  const list = useReturnsList();

  return (
    <div className="ret-root">
      <div className="ret-inner">

        {/* Header */}
        <div className="ret-header">
          <div className="ret-header-icon">📦</div>
          <div>
            <div className="ret-header-title">Lịch sử nhập trả hàng</div>
            <div className="ret-header-sub">Tra cứu, lọc và xuất phiếu nhập trả — Con Cưng SCA</div>
          </div>
          <div className="ret-header-spacer" />
          <Link href="/inputsale" className="ret-nav-link">
            ＋ Tạo phiếu nhập trả
          </Link>
        </div>

        {/* KPI cards */}
        <StatsBar stats={list.stats} />

        {list.loading && <div className="ret-banner loading">Đang tải danh sách phiếu...</div>}
        {list.error && <div className="ret-banner error">{list.error}</div>}

        {/* Search + filter */}
        <SearchBar
          keyword={list.keyword}
          status={list.status}
          dateFrom={list.dateFrom}
          dateTo={list.dateTo}
          total={list.totalRecords}
          filtered={list.filtered.length}
          onKeyword={(v) => { list.setKeyword(v); list.setPage(1); }}
          onStatus={(v)  => { list.setStatus(v);  list.setPage(1); }}
          onDateFrom={(v) => { list.setDateFrom(v); list.setPage(1); }}
          onDateTo={(v)   => { list.setDateTo(v);   list.setPage(1); }}
          onReset={list.resetFilters}
        />

        {/* Data table */}
        <ReturnsTable
          rows={list.rows}
          sortField={list.sortField}
          sortDir={list.sortDir}
          page={list.page}
          totalPages={list.totalPages}
          onSort={list.handleSort}
          onPage={list.setPage}
        />

      </div>
    </div>
  );
}
