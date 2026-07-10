import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  Attendee, 
  AttendeeType, 
  RegistrationStatus, 
  SalesTransaction, 
  BoothGroup, 
  ProductCategory, 
  BusinessNegotiation, 
  NegotiationStatus, 
  EmailLog 
} from "../types";

// Setup Firestore collection names
const ATTENDEES_COL = "attendees";
const TRANSACTIONS_COL = "transactions";
const NEGOTIATIONS_COL = "negotiations";
const EMAILS_COL = "emails";

// Mock/Default seed data matching the Satun Herbal City 2026 event details
const SEED_ATTENDEES: Omit<Attendee, "id">[] = [
  {
    name: "นายสิทธิโชค ศิริวิศาลกุล",
    phone: "081-234-5678",
    email: "sittichok@gmail.com",
    type: AttendeeType.GOVERNMENT,
    organization: "สำนักงานสาธรณสุขจังหวัดสตูล",
    regDate: "2026-07-16",
    regTime: "09:05",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "นางสมศรี เส้นดีโอ๊ะ",
    phone: "089-876-5432",
    email: "somsri.s@gmail.com",
    type: AttendeeType.FARMER,
    organization: "กลุ่มผู้ปลูกสมุนไพรควนโดน",
    regDate: "2026-07-16",
    regTime: "09:15",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "ดร.ณัฐดนัย สิทธิภาจิรสกุล",
    phone: "086-555-1234",
    email: "natdanai.s@skru.ac.th",
    type: AttendeeType.VIP,
    organization: "คณะเภสัชศาสตร์ มหาวิทยาลัยสงขลานครินทร์",
    regDate: "2026-07-16",
    regTime: "09:25",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "นายประยูร โขชิต",
    phone: "084-333-4455",
    email: "prayoon.k@satunchamber.com",
    type: AttendeeType.ENTREPRENEUR,
    organization: "หอการค้าจังหวัดสตูล / สภาอุตสาหกรรมสตูล",
    regDate: "2026-07-16",
    regTime: "09:40",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "นางสาวนิสากร โต๊ะหล๊ะ",
    phone: "093-456-7890",
    email: "nisakorn.t@gmail.com",
    type: AttendeeType.GENERAL,
    organization: "ประชาชนทั่วไป (อ.เมืองสตูล)",
    regDate: "2026-07-16",
    regTime: "10:10",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "ดร.พรอนันต์ เพียรเดชา",
    phone: "085-777-8899",
    email: "porn-anan@agriculture.go.th",
    type: AttendeeType.VIP,
    organization: "สภาเกษตรกรจังหวัดสตูล",
    regDate: "2026-07-16",
    regTime: "10:30",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "นางกัญญาภรณ์ มะลิวรรณ",
    phone: "081-999-8888",
    email: "kanya.m@gmail.com",
    type: AttendeeType.FARMER,
    organization: "วิสาหกิจชุมชนสมุนไพรบ้านท่าแพ",
    regDate: "2026-07-17",
    regTime: "08:45",
    status: RegistrationStatus.SUCCESS,
    createdAt: new Date().toISOString()
  },
  {
    name: "นายอับดุลเลาะห์ หรนหลัง",
    phone: "080-111-2222",
    email: "abdullah.h@gmail.com",
    type: AttendeeType.ENTREPRENEUR,
    organization: "บารากัต ชาสมุนไพรสตูล",
    regDate: "2026-07-17",
    regTime: "09:00",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "เด็กหญิงฟาติมะห์ สุวรรณจิตต์",
    phone: "095-222-3333",
    email: "fatimah.s@school.ac.th",
    type: AttendeeType.STUDENT,
    organization: "โรงเรียนควนโดนวิทยา",
    regDate: "2026-07-16",
    regTime: "11:20",
    status: RegistrationStatus.CHECKED_IN,
    createdAt: new Date().toISOString()
  },
  {
    name: "นายไพศาล สันหลัง",
    phone: "082-444-5555",
    email: "phaisan.s@gmail.com",
    type: AttendeeType.GENERAL,
    organization: "ประชาชนทั่วไป (อ.ละงู)",
    regDate: "2026-07-17",
    regTime: "10:15",
    status: RegistrationStatus.SUCCESS,
    createdAt: new Date().toISOString()
  }
];

const SEED_TRANSACTIONS: Omit<SalesTransaction, "id">[] = [
  {
    boothGroup: BoothGroup.UPSTREAM,
    boothNumber: "A01",
    boothName: "วิสาหกิจเพาะปลูกสมุนไพรอินทรีย์ควนโดน",
    productCategory: ProductCategory.PRODUCT,
    productName: "ต้นกล้าขมิ้นชันเกรดพรีเมียม (GAP)",
    amount: 3200,
    ordersCount: 16,
    recordDate: "2026-07-16",
    recordTime: "10:15",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.UPSTREAM,
    boothNumber: "A05",
    boothName: "กลุ่มเกษตรกรผสมผสานควนสตูล",
    productCategory: ProductCategory.PRODUCT,
    productName: "หัวไพลสดออร์แกนิกบรรจุถุง 1 กก.",
    amount: 1800,
    ordersCount: 12,
    recordDate: "2026-07-16",
    recordTime: "11:30",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.MIDSTREAM,
    boothNumber: "B02",
    boothName: "วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านเขาบันได",
    productCategory: ProductCategory.PRODUCT,
    productName: "ชาสมุนไพรเกสรบัวหลวงและขิงผงสำเร็จรูป",
    amount: 7500,
    ordersCount: 30,
    recordDate: "2026-07-16",
    recordTime: "11:45",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.MIDSTREAM,
    boothNumber: "B04",
    boothName: "แปรรูปสมุนไพรโรงพยาบาลสตูล",
    productCategory: ProductCategory.PRODUCT,
    productName: "ยาสมุนไพรฟ้าทะลายโจรชนิดแคปซูล และลูกประคบแห้ง",
    amount: 12500,
    ordersCount: 62,
    recordDate: "2026-07-16",
    recordTime: "14:20",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.DOWNSTREAM,
    boothNumber: "C01",
    boothName: "ศูนย์เวลเนสควนโดน (Wellness Center)",
    productCategory: ProductCategory.SERVICE,
    productName: "บริการนวดไทยเพื่อสุขภาพและกดจุดสะท้อนเท้า (45 นาที)",
    amount: 5400,
    ordersCount: 18,
    recordDate: "2026-07-16",
    recordTime: "15:10",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.DOWNSTREAM,
    boothNumber: "C03",
    boothName: "สปาและอบสมุนไพรชุมชนเขาโต๊ะพญาสตูล",
    productCategory: ProductCategory.SERVICE,
    productName: "คอร์สสปาขัดผิวด้วยสครับขมิ้นน้ำผึ้งป่า",
    amount: 8800,
    ordersCount: 11,
    recordDate: "2026-07-16",
    recordTime: "16:40",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.WORKSHOP,
    boothNumber: "D01",
    boothName: "บารากัต ชาสมุนไพรและเครื่องดื่มสร้างสรรค์",
    productCategory: ProductCategory.PRODUCT,
    productName: "อัญชันมะนาวน้ำผึ้งป่า และชากระเจี๊ยบเย็น",
    amount: 4500,
    ordersCount: 90,
    recordDate: "2026-07-16",
    recordTime: "13:00",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.WORKSHOP,
    boothNumber: "D03",
    boothName: "ร้านอาหารสุขภาพบ้านสวนสมุนไพร",
    productCategory: ProductCategory.PRODUCT,
    productName: "สลัดโรลแป้งข้าวสังข์หยดราดซอสขมิ้นชัน",
    amount: 3800,
    ordersCount: 38,
    recordDate: "2026-07-16",
    recordTime: "12:30",
    createdAt: new Date().toISOString()
  },
  
  // Day 2 (17 July 2026)
  {
    boothGroup: BoothGroup.MIDSTREAM,
    boothNumber: "B02",
    boothName: "วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านเขาบันได",
    productCategory: ProductCategory.PRODUCT,
    productName: "สบู่สมุนไพรขมิ้นผสมมะขามเปียก (แพ็กคู่)",
    amount: 5200,
    ordersCount: 26,
    recordDate: "2026-07-17",
    recordTime: "10:30",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.DOWNSTREAM,
    boothNumber: "C01",
    boothName: "ศูนย์เวลเนสควนโดน (Wellness Center)",
    productCategory: ProductCategory.SERVICE,
    productName: "การพอกเข่าและประคบด้วยสมุนไพรสดสูตรเฉพาะ",
    amount: 7200,
    ordersCount: 24,
    recordDate: "2026-07-17",
    recordTime: "11:15",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.WORKSHOP,
    boothNumber: "D05",
    boothName: "วิทยากรสาธิต เวอร์จิ้นโมฮีโต้สมุนไพรสตูล (Virgin Mojito)",
    productCategory: ProductCategory.PRODUCT,
    productName: "น้ำดื่มม็อกเทลสะระแหน่มะนาวสดต้านอนุมูลอิสระ",
    amount: 6200,
    ordersCount: 124,
    recordDate: "2026-07-17",
    recordTime: "14:45",
    createdAt: new Date().toISOString()
  },
  {
    boothGroup: BoothGroup.UPSTREAM,
    boothNumber: "A02",
    boothName: "กลุ่มเกษตรกรเพาะพันธุ์บัวบกละงู",
    productCategory: ProductCategory.PRODUCT,
    productName: "สารสกัดบัวบกชนิดผงบริสุทธิ์เพื่อป้อนโรงงาน",
    amount: 15000,
    ordersCount: 5,
    recordDate: "2026-07-17",
    recordTime: "15:30",
    createdAt: new Date().toISOString()
  }
];

const SEED_NEGOTIATIONS: Omit<BusinessNegotiation, "id">[] = [
  {
    partnerName: "คุณปิยะบุตร อัครพงศ์ไพศาล",
    partnerOrg: "บริษัท ผลิตภัณฑ์สุขภาพไทย จำกัด (กรุงเทพฯ)",
    boothName: "วิสาหกิจเพาะปลูกสมุนไพรอินทรีย์ควนโดน (บูธ A01)",
    productInterested: "วัตถุดิบขมิ้นชันตากแห้งหั่นแว่นออร์แกนิก (มาตรฐาน GAP)",
    negotiationValue: 450000,
    status: NegotiationStatus.SUCCESS,
    recordDate: "2026-07-16",
    recordTime: "14:30",
    notes: "ลงนามบันทึกข้อตกลงร่วมกัน (MOU) ซื้อขายขมิ้นชันแห้งขั้นต่ำ 3 ตันต่อปี เริ่มส่งมอบไตรมาส 4 ปี 2569",
    createdAt: new Date().toISOString()
  },
  {
    partnerName: "เภสัชกรหญิงอัญชลี ศิริสุวรรณ",
    partnerOrg: "โรงพยาบาลกรุงเทพหาดใหญ่",
    boothName: "สปาและอบสมุนไพรชุมชนเขาโต๊ะพญาสตูล (บูธ C03)",
    productInterested: "น้ำมันนวดสมุนไพรร้อนสูตรน้ำมันไพลสตูล",
    negotiationValue: 120000,
    status: NegotiationStatus.IN_PROGRESS,
    recordDate: "2026-07-16",
    recordTime: "15:45",
    notes: "สนใจนำสินค้าไปใช้ในคลินิกกายภาพบำบัดของโรงพยาบาล ขอนำตัวอย่างส่งแล็บประเมินมาตรฐานก่อน",
    createdAt: new Date().toISOString()
  },
  {
    partnerName: "คุณธนาพงศ์ จตุรพาณิชย์",
    partnerOrg: "ห้างหุ้นส่วนจำกัด สตูลสมุนไพรส่งออก",
    boothName: "วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านเขาบันได (บูธ B02)",
    productInterested: "ชาสมุนไพรแปรรูป และผลิตภัณฑ์เครื่องสำอางสมุนไพรสครับผิว",
    negotiationValue: 280000,
    status: NegotiationStatus.SUCCESS,
    recordDate: "2026-07-17",
    recordTime: "11:30",
    notes: "ตกลงเป็นตัวแทนจำหน่ายเพื่อนำสินค้าไปเปิดตลาดในกลุ่มประเทศอาเซียน (มาเลเซีย-อินโดนีเซีย)",
    createdAt: new Date().toISOString()
  },
  {
    partnerName: "คุณมูฮัมหมัด นาจิบ",
    partnerOrg: "Langkawi Wellness Retailer (มาเลเซีย)",
    boothName: "ศูนย์เวลเนสควนโดน (Wellness Center) (บูธ C01)",
    productInterested: "หลักสูตรฝึกอบรมนวดไทยและการจัดหาผลิตภัณฑ์นวดสมุนไพรสตูล",
    negotiationValue: 350000,
    status: NegotiationStatus.FOLLOW_UP,
    recordDate: "2026-07-17",
    recordTime: "13:15",
    notes: "คู่ค้าจากมาเลเซียสนใจร่วมมือจัดส่งนักบำบัดมาอบรมที่ควนโดน และซื้อผลิตภัณฑ์สมุนไพรพ่วงสิทธิ์สปา",
    createdAt: new Date().toISOString()
  }
];

// Helper to seed all data at once if collections are empty
export async function seedAllDataIfEmpty(): Promise<boolean> {
  try {
    const attendeeSnapshot = await getDocs(collection(db, ATTENDEES_COL));
    if (attendeeSnapshot.empty) {
      console.log("Seeding attendees...");
      for (const item of SEED_ATTENDEES) {
        await addDoc(collection(db, ATTENDEES_COL), item);
      }
      
      console.log("Seeding transactions...");
      for (const item of SEED_TRANSACTIONS) {
        await addDoc(collection(db, TRANSACTIONS_COL), item);
      }
      
      console.log("Seeding negotiations...");
      for (const item of SEED_NEGOTIATIONS) {
        await addDoc(collection(db, NEGOTIATIONS_COL), item);
      }
      
      // Seed a few email logs
      console.log("Seeding simulated emails...");
      const seededAttendeesDocs = await getDocs(collection(db, ATTENDEES_COL));
      const seededAttendees = seededAttendeesDocs.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Attendee));
      
      for (let i = 0; i < 4 && i < seededAttendees.length; i++) {
        const attendee = seededAttendees[i];
        const emailLog: Omit<EmailLog, "id"> = {
          attendeeId: attendee.id,
          recipientName: attendee.name,
          recipientEmail: attendee.email,
          subject: "🎉 ยืนยันการลงทะเบียนเข้าร่วมงานมหกรรมเมืองสมุนไพรจังหวัดสตูล 2569",
          body: `สวัสดีคุณ ${attendee.name},\n\nระบบได้รับการยืนยันการลงทะเบียนเข้าร่วมงาน "มหกรรมเมืองสมุนไพรจังหวัดสตูล 2569" (Satun Herbal City 2026) เรียบร้อยแล้ว!\n\n📅 วันจัดงาน: 16 - 17 กรกฎาคม 2569\n📍 สถานที่: ศูนย์บริการนักท่องเที่ยว Satun Geopark Gateway อำเภอควนโดน จังหวัดสตูล\n\n🔖 ประเภทผู้เข้าร่วม: ${attendee.type}\n🏢 สังกัด/หน่วยงาน: ${attendee.organization || "-"}\n⏰ เวลาลงทะเบียนในระบบ: ${attendee.regDate} เวลา ${attendee.regTime} น.\n\nกรุณาแสดงรหัสลงทะเบียนนี้ ณ จุดเข้างาน เพื่อความสะดวกในการเช็คอิน\n[รหัส QR Code ลงทะเบียน: REG-${attendee.id.substring(0, 8).toUpperCase()}]\n\nขอขอบพระคุณอย่างสูง\nกลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก สำนักงานสาธารณสุขจังหวัดสตูล`,
          sentAt: new Date().toISOString(),
          status: "ส่งสำเร็จ (Delivered)"
        };
        await addDoc(collection(db, EMAILS_COL), emailLog);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error seeding data to Firestore:", error);
    return false;
  }
}

// ---------------- ATTENDEES API ----------------
export async function getAllAttendees(): Promise<Attendee[]> {
  try {
    const q = query(collection(db, ATTENDEES_COL), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Attendee));
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return [];
  }
}

export async function addAttendee(attendee: Omit<Attendee, "id" | "createdAt">): Promise<Attendee | null> {
  try {
    const newAttendee = {
      ...attendee,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, ATTENDEES_COL), newAttendee);
    
    // Automatically trigger visual simulated email notification for the attendee!
    const subject = `🎉 ยืนยันการลงทะเบียนเข้าร่วมงานมหกรรมเมืองสมุนไพรจังหวัดสตูล 2569`;
    const body = `เรียน คุณ ${attendee.name},\n\nระบบได้รับการยืนยันการลงทะเบียนเข้าร่วมงาน "มหกรรมเมืองสมุนไพรจังหวัดสตูล 2569" (Satun Herbal City 2026) สำเร็จเรียบร้อยแล้ว!\n\n📅 วันจัดงาน: 16 - 17 กรกฎาคม 2569\n📍 สถานที่: ศูนย์บริการนักท่องเที่ยว Satun Geopark Gateway อำเภอควนโดน จังหวัดสตูล\n\n🔖 ประเภทผู้เข้าร่วม: ${attendee.type}\n🏢 สังกัด/หน่วยงาน: ${attendee.organization || "-"}\n⏰ เวลาที่ลงทะเบียน: วันที่ ${attendee.regDate} เวลา ${attendee.regTime} น.\n\nกรุณาใช้หน้าจอนี้หรือตรวจสอบรหัสยืนยันในอีเมลของท่านเมื่อเช็คอินเข้างาน\n[รหัสอ้างอิง: REG-${docRef.id.substring(0, 8).toUpperCase()}]\n\nขอแสดงความนับถือ,\nกลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก สำนักงานสาธารณสุขจังหวัดสตูล\nโทรศัพท์: 0 ๗๔๗๑ ๑๐๗๓`;
    
    const emailLog: Omit<EmailLog, "id"> = {
      attendeeId: docRef.id,
      recipientName: attendee.name,
      recipientEmail: attendee.email,
      subject,
      body,
      sentAt: new Date().toISOString(),
      status: "ส่งสำเร็จ (Delivered)"
    };
    await addDoc(collection(db, EMAILS_COL), emailLog);

    return {
      id: docRef.id,
      ...newAttendee
    };
  } catch (error) {
    console.error("Error adding attendee:", error);
    return null;
  }
}

export async function updateAttendeeStatus(id: string, status: RegistrationStatus): Promise<boolean> {
  try {
    const docRef = doc(db, ATTENDEES_COL, id);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating attendee:", error);
    return false;
  }
}

export async function deleteAttendee(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, ATTENDEES_COL, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting attendee:", error);
    return false;
  }
}

// ---------------- TRANSACTIONS API ----------------
export async function getAllTransactions(): Promise<SalesTransaction[]> {
  try {
    const q = query(collection(db, TRANSACTIONS_COL), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SalesTransaction));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function addTransaction(tx: Omit<SalesTransaction, "id" | "createdAt">): Promise<SalesTransaction | null> {
  try {
    const newTx = {
      ...tx,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, TRANSACTIONS_COL), newTx);
    return {
      id: docRef.id,
      ...newTx
    };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, TRANSACTIONS_COL, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
}

// ---------------- NEGOTIATIONS API ----------------
export async function getAllNegotiations(): Promise<BusinessNegotiation[]> {
  try {
    const q = query(collection(db, NEGOTIATIONS_COL), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BusinessNegotiation));
  } catch (error) {
    console.error("Error fetching negotiations:", error);
    return [];
  }
}

export async function addNegotiation(neg: Omit<BusinessNegotiation, "id" | "createdAt">): Promise<BusinessNegotiation | null> {
  try {
    const newNeg = {
      ...neg,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, NEGOTIATIONS_COL), newNeg);
    return {
      id: docRef.id,
      ...newNeg
    };
  } catch (error) {
    console.error("Error adding negotiation:", error);
    return null;
  }
}

export async function updateNegotiationStatus(id: string, status: NegotiationStatus): Promise<boolean> {
  try {
    const docRef = doc(db, NEGOTIATIONS_COL, id);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating negotiation:", error);
    return false;
  }
}

export async function deleteNegotiation(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, NEGOTIATIONS_COL, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting negotiation:", error);
    return false;
  }
}

// ---------------- EMAIL LOGS API ----------------
export async function getAllEmailLogs(): Promise<EmailLog[]> {
  try {
    const q = query(collection(db, EMAILS_COL), orderBy("sentAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EmailLog));
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return [];
  }
}
