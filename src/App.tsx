import React, { useState, useEffect } from "react";
import { Loader2, Leaf, Calendar, MapPin, RefreshCw, Layers } from "lucide-react";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import RegistrationView from "./components/RegistrationView";
import SalesView from "./components/SalesView";
import NegotiationView from "./components/NegotiationView";
import NotificationInbox from "./components/NotificationInbox";
import { 
  getAllAttendees, 
  getAllTransactions, 
  getAllNegotiations, 
  getAllEmailLogs,
  seedAllDataIfEmpty
} from "./lib/dbHelper";
import { Attendee, SalesTransaction, BusinessNegotiation, EmailLog } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [negotiations, setNegotiations] = useState<BusinessNegotiation[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Function to pull all fresh data from Firestore
  const fetchAllData = async (showSilently = false) => {
    if (!showSilently) setIsLoading(true);
    try {
      // Fetch concurrently for speed
      const [atts, txs, negs, logs] = await Promise.all([
        getAllAttendees(),
        getAllTransactions(),
        getAllNegotiations(),
        getAllEmailLogs()
      ]);
      setAttendees(atts);
      setTransactions(txs);
      setNegotiations(negs);
      setEmailLogs(logs);
    } catch (e) {
      console.error("Error loading Firestore databases:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: auto-seed database if empty, then fetch everything
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        // Auto-seed if database is empty so dashboard is pre-populated
        await seedAllDataIfEmpty();
        await fetchAllData(true);
      } catch (e) {
        console.error("Error initializing app:", e);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header Section */}
      <Header 
        onRefresh={() => fetchAllData(true)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSeeding={isSeeding}
        setIsSeeding={setIsSeeding}
      />

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
              <Leaf className="w-5 h-5 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">กำลังดาวน์โหลดข้อมูลเรียลไทม์...</p>
              <p className="text-xs text-slate-400 mt-1">กรุณารอการเชื่อมต่อและดึงสถิติจากระบบฐานข้อมูลสักครู่</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Active Rendered tab */}
            {activeTab === "dashboard" && (
              <DashboardView 
                attendees={attendees} 
                transactions={transactions} 
                negotiations={negotiations}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "registration" && (
              <RegistrationView 
                attendees={attendees} 
                onRefresh={() => fetchAllData(true)} 
              />
            )}

            {activeTab === "sales" && (
              <SalesView 
                transactions={transactions} 
                onRefresh={() => fetchAllData(true)} 
              />
            )}

            {activeTab === "negotiation" && (
              <NegotiationView 
                negotiations={negotiations} 
                onRefresh={() => fetchAllData(true)} 
              />
            )}

            {activeTab === "notifications" && (
              <NotificationInbox 
                emailLogs={emailLogs} 
                onRefresh={() => fetchAllData(true)} 
              />
            )}

          </div>
        )}

      </main>

      {/* Bottom Footer Section */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-600">งานมหกรรมเมืองสมุนไพรจังหวัดสตูล ๒๕๖๙</span>
          </div>
          <div>
            พัฒนาโดย กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก สำนักงานสาธารณสุขจังหวัดสตูล
          </div>
          <div className="font-mono text-[10px]">
            v1.0.0 (Satun Geopark Gateway)
          </div>
        </div>
      </footer>

    </div>
  );
}
