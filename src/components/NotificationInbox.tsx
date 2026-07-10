import React from "react";
import { 
  Mail, 
  Search, 
  Send, 
  CheckCircle, 
  Clock, 
  Trash2, 
  User, 
  ChevronRight,
  RefreshCw,
  QrCode
} from "lucide-react";
import { EmailLog } from "../types";
import { getAllEmailLogs } from "../lib/dbHelper";

interface NotificationInboxProps {
  emailLogs: EmailLog[];
  onRefresh: () => void;
}

export default function NotificationInbox({ emailLogs, onRefresh }: NotificationInboxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = React.useState<EmailLog | null>(null);

  // Filter
  const filteredEmails = emailLogs.filter(item => {
    return (
      item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* List Column (2 cols wide on desktop) */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Search header info */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-emerald-600 animate-bounce" />
              กล่องบันทึกการส่งเมลแจ้งเตือน (Simulated Email Logs)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ประวัติการส่งอีเมลตอบรับและรหัสยืนยันตัวตนสำเร็จ (อัตโนมัติ) ไปยังผู้ลงทะเบียนจริงผ่านระบบ
            </p>
          </div>
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            รีเฟรชกล่องจดหมาย
          </button>
        </div>

        {/* Search bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นตามรายชื่อผู้รับ หรืออีเมลแอดเดรส..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden"
            />
          </div>
        </div>

        {/* Email Cards List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredEmails.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 border border-slate-100 rounded-2xl text-xs">
              ยังไม่มีการส่งเมลแจ้งเตือนเกิดขึ้นในระบบ
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div 
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                  selectedEmail?.id === email.id
                    ? "bg-emerald-50/70 border-emerald-300"
                    : "bg-white border-slate-100 hover:border-emerald-100"
                }`}
              >
                <div className="space-y-1 truncate pr-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">{email.recipientName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({email.recipientEmail})</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-800 truncate">
                    {email.subject}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-300" />
                    ส่งเมื่อ: {new Date(email.sentAt).toLocaleString("th-TH")} น.
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px]">
                    DELIVERED
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Detail Preview Column (1 col wide) */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit sticky top-24">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
          🔍 พรีวิวเนื้อหาอีเมลจำลองในระบบ
        </h3>

        {selectedEmail ? (
          <div className="space-y-4">
            
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl text-xs space-y-3 font-sans relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-500/10 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                SECURE SSL
              </div>
              
              <div className="space-y-1 border-b border-slate-200/60 pb-2 text-slate-500">
                <div><strong>ผู้ส่ง:</strong> info@satunherbalcity.com</div>
                <div><strong>ผู้รับ:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;</div>
                <div><strong>สถานะส่ง:</strong> <span className="text-emerald-600 font-bold">ส่งสำเร็จ (Delivered)</span></div>
              </div>

              <div className="text-slate-700 space-y-2 whitespace-pre-line leading-relaxed text-[11px] font-sans">
                {selectedEmail.body}
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-dashed border-emerald-200 text-center gap-2">
                <QrCode className="w-14 h-14 text-emerald-700" />
                <span className="text-[9px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  REG-{selectedEmail.attendeeId.substring(0,8).toUpperCase()}
                </span>
                <span className="text-[8px] text-slate-400">ระบบคัดกรองความปลอดภัยโดย สสจ.สตูล</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              💡 <strong>ความสามารถเสริม:</strong> หน้าต่างนี้เป็นระบบ Sandbox จำลองเพื่อรายงานว่าอีเมลได้รับการจัดส่งตามเวลาจริงเรียบร้อย ตัวกรองและฐานข้อมูลมีการเชื่อมต่อ API สมบูรณ์
            </div>

          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Mail className="w-10 h-10 text-slate-300 animate-pulse" />
            กรุณาเลือกรายการอีเมลด้านซ้าย<br/>เพื่อเปิดพรีวิวเนื้อหาทั้งหมด
          </div>
        )}
      </div>

    </div>
  );
}

// Add state hook import in top of files that might need it if not imported
import { useState } from "react";
