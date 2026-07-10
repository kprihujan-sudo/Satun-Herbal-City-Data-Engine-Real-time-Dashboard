export enum AttendeeType {
  VIP = "แขกผู้มีเกียรติ",
  GOVERNMENT = "บุคลากรภาครัฐ",
  FARMER = "เกษตรกร",
  ENTREPRENEUR = "ผู้ประกอบการ",
  STUDENT = "นักเรียน/นักศึกษา",
  GENERAL = "ประชาชนทั่วไป"
}

export enum RegistrationStatus {
  SUCCESS = "ลงทะเบียนสำเร็จ",
  CHECKED_IN = "เช็คอินเข้างานแล้ว",
  CANCELLED = "ยกเลิก"
}

export interface Attendee {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: AttendeeType;
  organization: string;
  regDate: string; // "2026-07-16" or "2026-07-17"
  regTime: string; // "HH:MM"
  status: RegistrationStatus;
  createdAt: any;
}

export enum BoothGroup {
  UPSTREAM = "กลุ่มต้นน้ำ (วัตถุดิบ/เพาะปลูก)",
  MIDSTREAM = "กลุ่มกลางน้ำ (แปรรูป/ผลิตภัณฑ์)",
  DOWNSTREAM = "กลุ่มปลายน้ำ (บริการสุขภาพ/Wellness)",
  WORKSHOP = "กลุ่มอาหารและกิจกรรมเวิร์กช็อป"
}

export enum ProductCategory {
  PRODUCT = "สินค้า",
  SERVICE = "บริการ"
}

export interface SalesTransaction {
  id: string;
  boothGroup: BoothGroup;
  boothNumber: string;
  boothName: string;
  productCategory: ProductCategory;
  productName: string;
  amount: number; // Baht
  ordersCount: number; // จำนวนรายการสั่งซื้อ
  recordDate: string; // "2026-07-16" or "2026-07-17"
  recordTime: string;
  createdAt: any;
}

export enum NegotiationStatus {
  SUCCESS = "เจรจาสำเร็จ (MOU/ซื้อขาย)",
  IN_PROGRESS = "อยู่ระหว่างเจรจา",
  FOLLOW_UP = "กำลังติดตามผล"
}

export interface BusinessNegotiation {
  id: string;
  partnerName: string; // ผู้ซื้อ/ผู้เจรจา
  partnerOrg: string; // บริษัท/หน่วยงานผู้ซื้อ
  boothName: string; // บูธผู้ขายในงาน
  productInterested: string; // สินค้า/สมุนไพรที่สนใจ
  negotiationValue: number; // มูลค่า (บาท)
  status: NegotiationStatus;
  recordDate: string; // "2026-07-16" or "2026-07-17"
  recordTime: string;
  notes: string;
  createdAt: any;
}

export interface EmailLog {
  id: string;
  attendeeId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: string; // "Delivered"
}
