"use client";

interface Props {
  keyword: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  total: number;
  filtered: number;
  onKeyword: (v: string) => void;
  onStatus: (v: string) => void;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
  onReset: () => void;
}

export function SearchBar({ keyword, status, dateFrom, dateTo, total, filtered, onKeyword, onStatus, onDateFrom, onDateTo, onReset }: Props) {
  const dirty = !!(keyword || status || dateFrom || dateTo);

  return (
    <div className="ret-search-bar">
      <div className="ret-search-fields">
        <div className="ret-field">
          <label className="ret-label">Tìm kiếm</label>
          <input
            className="ret-input"
            placeholder="Mã phiếu, đơn hàng, tên khách..."
            value={keyword}
            onChange={(e) => onKeyword(e.target.value)}
          />
        </div>
        <div className="ret-field">
          <label className="ret-label">Trạng thái</label>
          <select className="ret-input" value={status} onChange={(e) => onStatus(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Hủy">Hủy</option>
          </select>
        </div>
        <div className="ret-field">
          <label className="ret-label">Từ ngày</label>
          <input type="date" className="ret-input" value={dateFrom} onChange={(e) => onDateFrom(e.target.value)} />
        </div>
        <div className="ret-field">
          <label className="ret-label">Đến ngày</label>
          <input type="date" className="ret-input" value={dateTo} onChange={(e) => onDateTo(e.target.value)} />
        </div>
        {dirty && (
          <button className="ret-btn-reset" onClick={onReset}>
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>
      <div className="ret-result-count">
        {dirty
          ? `${filtered} / ${total} phiếu`
          : `${total} phiếu`}
      </div>
    </div>
  );
}
