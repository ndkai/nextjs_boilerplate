import type { InputSaleRes } from "@/lib/types/input-sale";

export const DEMO_RETURNS: (InputSaleRes & { Status: "Hoàn thành" | "Đang xử lý" | "Hủy" })[] = [
  { ISID: 1,  InputSaleID: "IS-2024-110234", OutputSaleID: "OS-2024-002831", CustomerName: "Nguyễn Thị Mai",   TotalAmount: 1_690_000, TotalQuantity: 3, CreatedDate: "2024-11-10T08:22:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 2,  InputSaleID: "IS-2024-110235", OutputSaleID: "OS-2024-002845", CustomerName: "Trần Văn An",      TotalAmount:   760_000, TotalQuantity: 1, CreatedDate: "2024-11-10T09:05:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 3,  InputSaleID: "IS-2024-110236", OutputSaleID: "OS-2024-002899", CustomerName: "Phạm Thị Hương",   TotalAmount: 2_450_000, TotalQuantity: 4, CreatedDate: "2024-11-10T10:44:00", TotalRecord: 0, Status: "Đang xử lý"    },
  { ISID: 4,  InputSaleID: "IS-2024-110237", OutputSaleID: "OS-2024-002901", CustomerName: "Lê Minh Tuấn",     TotalAmount:   930_000, TotalQuantity: 2, CreatedDate: "2024-11-10T11:10:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 5,  InputSaleID: "IS-2024-110238", OutputSaleID: "OS-2024-002912", CustomerName: "Đỗ Thị Lan",       TotalAmount: 3_200_000, TotalQuantity: 5, CreatedDate: "2024-11-10T13:30:00", TotalRecord: 0, Status: "Hủy"           },
  { ISID: 6,  InputSaleID: "IS-2024-110239", OutputSaleID: "OS-2024-002933", CustomerName: "Hoàng Văn Bình",   TotalAmount: 1_140_000, TotalQuantity: 2, CreatedDate: "2024-11-11T08:00:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 7,  InputSaleID: "IS-2024-110240", OutputSaleID: "OS-2024-002940", CustomerName: "Ngô Thị Thu",      TotalAmount: 5_600_000, TotalQuantity: 6, CreatedDate: "2024-11-11T09:45:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 8,  InputSaleID: "IS-2024-110241", OutputSaleID: "OS-2024-002965", CustomerName: "Vũ Quang Hùng",    TotalAmount:   480_000, TotalQuantity: 1, CreatedDate: "2024-11-11T11:22:00", TotalRecord: 0, Status: "Đang xử lý"    },
  { ISID: 9,  InputSaleID: "IS-2024-110242", OutputSaleID: "OS-2024-002978", CustomerName: "Bùi Thị Ngọc",     TotalAmount: 2_100_000, TotalQuantity: 3, CreatedDate: "2024-11-11T14:05:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 10, InputSaleID: "IS-2024-110243", OutputSaleID: "OS-2024-003001", CustomerName: "Đinh Văn Long",     TotalAmount:   870_000, TotalQuantity: 2, CreatedDate: "2024-11-12T08:30:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 11, InputSaleID: "IS-2024-110244", OutputSaleID: "OS-2024-003014", CustomerName: "Phan Thị Hoa",     TotalAmount: 4_350_000, TotalQuantity: 7, CreatedDate: "2024-11-12T09:55:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 12, InputSaleID: "IS-2024-110245", OutputSaleID: "OS-2024-003029", CustomerName: "Trương Minh Đức",  TotalAmount: 1_280_000, TotalQuantity: 2, CreatedDate: "2024-11-12T13:00:00", TotalRecord: 0, Status: "Hủy"           },
  { ISID: 13, InputSaleID: "IS-2024-110246", OutputSaleID: "OS-2024-003041", CustomerName: "Lý Thị Kim",       TotalAmount:   650_000, TotalQuantity: 1, CreatedDate: "2024-11-12T15:20:00", TotalRecord: 0, Status: "Hoàn thành"    },
  { ISID: 14, InputSaleID: "IS-2024-110247", OutputSaleID: "OS-2024-003055", CustomerName: "Mai Quốc Toàn",    TotalAmount: 3_780_000, TotalQuantity: 5, CreatedDate: "2024-11-13T08:15:00", TotalRecord: 0, Status: "Đang xử lý"    },
  { ISID: 15, InputSaleID: "IS-2024-110248", OutputSaleID: "OS-2024-003062", CustomerName: "Cao Thị Yến",      TotalAmount: 2_900_000, TotalQuantity: 4, CreatedDate: "2024-11-13T10:40:00", TotalRecord: 0, Status: "Hoàn thành"    },
];

export type ReturnRow = (typeof DEMO_RETURNS)[0];
