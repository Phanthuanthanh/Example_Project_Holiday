import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Calendar, CreditCard, User, LogOut, Search, ChevronDown,
  Bell, CheckCircle, XCircle, AlertTriangle, Info, X, Plus, Edit2, Trash2,
  Download, ArrowLeft, Settings, BarChart2, GraduationCap, Users,
  FileText, Home, Clock, ChevronRight, Filter, RefreshCw, Save,
  AlertCircle, Check, Building2, Layers,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

type Role = "student" | "lecturer" | "registrar";

interface User {
  id: string;
  name: string;
  role: Role;
  department: string;
  avatar?: string;
  className?: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

// ─── API BASE & HELPERS ──────────────────────────────────────────────────────

const API_BASE = "http://localhost:8080/api";

async function apiCall(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Đã xảy ra lỗi hệ thống.");
  }
  return res.json();
}

const DEPARTMENTS = ["Tất cả", "CNTT", "Điện tử", "Cơ khí", "Kinh tế", "Ngoại ngữ"];

// ─── Utility Components ──────────────────────────────────────────────────────

function Badge({ variant, children }: { variant: "success" | "error" | "warning" | "info" | "default" | "blue"; children: React.ReactNode }) {
  const styles = {
    success: "bg-green-50 text-green-700 border border-green-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    blue: "bg-blue-600 text-white",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}>
      {variant === "success" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
      {variant === "error" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />}
      {variant === "warning" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
      {variant === "info" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
      {children}
    </span>
  );
}

function Btn({ variant = "primary", size = "md", onClick, disabled, children, className = "" }: {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  onClick?: () => void; disabled?: boolean; children: React.ReactNode; className?: string;
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required }: {
  label?: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>
  );
}

// Note: Select uses border styling, text size, and is rounded
function Select({ label, value, onChange, options, required }: {
  label?: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>{children}</div>;
}

function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} />}
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:text-blue-600 hover:underline transition-colors">{item.label}</button>
          ) : (
            <span className={i === items.length - 1 ? "text-gray-900 font-medium" : ""}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Modal({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  const icons = { success: <CheckCircle size={16} className="text-green-600" />, error: <XCircle size={16} className="text-red-600" />, warning: <AlertTriangle size={16} className="text-amber-600" />, info: <Info size={16} className="text-blue-600" /> };
  const borders = { success: "border-green-200 bg-green-50", error: "border-red-200 bg-red-50", warning: "border-amber-200 bg-amber-50", info: "border-blue-200 bg-blue-50" };
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg ${borders[t.type]} animate-in slide-in-from-right`}>
          {icons[t.type]}
          <p className="text-sm text-gray-800 flex-1">{t.message}</p>
          <button onClick={() => onClose(t.id)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function Pagination({ total, page, pageSize, onChange }: { total: number; page: number; pageSize: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
      <span>Hiển thị {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} / {total} mục</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="px-2 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors">‹</button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)} className={`px-3 py-1 rounded border transition-colors ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"}`}>{p}</button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === pages} className="px-2 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors">›</button>
      </div>
    </div>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const STUDENT_NAV = [
  { id: "student-dashboard", label: "Tổng quan", icon: Home },
  { id: "course-registration", label: "Đăng ký tín chỉ", icon: BookOpen },
  { id: "course-search", label: "Tra cứu lớp HP", icon: Search },
  { id: "timetable", label: "Thời khóa biểu", icon: Calendar },
  { id: "tuition", label: "Công nợ học phí", icon: CreditCard },
  { id: "personal-info", label: "Thông tin cá nhân", icon: User },
];

const LECTURER_NAV = [
  { id: "lecturer-dashboard", label: "Tổng quan", icon: Home },
  { id: "teaching-schedule", label: "Lịch giảng dạy", icon: Calendar },
  { id: "class-management", label: "Quản lý lớp giảng dạy", icon: Users },
];

const REGISTRAR_NAV = [
  { id: "registrar-dashboard", label: "Tổng quan", icon: Home },
  { id: "course-catalog", label: "Quản lý môn học", icon: BookOpen },
  { id: "class-offering", label: "Mở lớp học phần", icon: Layers },
  { id: "registration-config", label: "Cấu hình đợt ĐK", icon: Settings },
  { id: "reports", label: "Thống kê báo cáo", icon: BarChart2 },
];

function AppLayout({ user, currentPage, onNavigate, onLogout, children }: {
  user: User; currentPage: string; onNavigate: (p: string) => void;
  onLogout: () => void; children: React.ReactNode;
}) {
  const nav = user.role === "student" ? STUDENT_NAV : user.role === "lecturer" ? LECTURER_NAV : REGISTRAR_NAV;
  const roleLabel = user.role === "student" ? "Sinh viên" : user.role === "lecturer" ? "Giảng viên" : "Phòng Đào tạo";

  return (
    <div className="flex h-screen bg-gray-50 font-[Inter,sans-serif]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">Hệ thống CRMS</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all ${active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
              >
                <Icon size={16} className={active ? "text-blue-600" : "text-gray-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
              {user.name.split(" ").slice(-1)[0].charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.name.split(" ").slice(-2).join(" ")}</div>
              <div className="text-xs text-gray-500">{roleLabel}</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium">
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{user.name}</span>
            <span className="text-gray-400">·</span>
            <span>{user.role === "student" ? user.id : ""}</span>
            <span className="text-gray-400">·</span>
            <span className="text-blue-600 font-medium">HK2 2025-2026</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <Bell size={18} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Badge variant="info">{roleLabel}</Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">{children}</main>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password, role }),
      });
      onLogin({
        id: res.id,
        name: res.name,
        role: res.role,
        department: res.department,
        className: res.className || "Chưa gán lớp",
      });
    } catch (e: any) {
      setError(e.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 font-[Inter,sans-serif]">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Hệ thống Quản lý Đăng ký Học phần (CRMS)</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Đăng nhập hệ thống</h2>

          <div className="space-y-4">
            <Input label="Tên đăng nhập" value={username} onChange={setUsername} placeholder="MSSV / Mã GV / Mã NV" required />
            <Input label="Mật khẩu" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            <Select
              label="Vai trò"
              value={role}
              onChange={v => setRole(v as Role)}
              options={[
                { value: "student", label: "Sinh viên" },
                { value: "lecturer", label: "Giảng viên" },
                { value: "registrar", label: "Phòng Đào tạo (Admin)" },
              ]}
              required
            />
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
              <XCircle size={15} className="text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading ? <><RefreshCw size={15} className="animate-spin" /> Đang đăng nhập...</> : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ user }: { user: User }) {
  const [registeredCredits, setRegisteredCredits] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [debtAmount, setDebtAmount] = useState(0);
  const [debtStatus, setDebtStatus] = useState("Chưa đóng");
  const [invoiceDeadline, setInvoiceDeadline] = useState("N/A");
  const [timetable, setTimetable] = useState<any[]>([]);

  useEffect(() => {
    // Fetch registered classes count
    apiCall(`/student/registrations?studentId=${user.id}`).then(data => {
      setRegisteredCount(data.length);
      const credits = data.reduce((s: number, c: any) => s + c.credits, 0);
      setRegisteredCredits(credits);
    }).catch(console.error);

    // Fetch invoices to display debt details
    apiCall(`/student/invoices?studentId=${user.id}`).then(data => {
      // Find overdue or unpaid invoices
      const currentInvoice = data.find((inv: any) => inv.status === "unpaid" || inv.status === "overdue" || inv.status === "partially_paid") || data[0];
      if (currentInvoice) {
        setDebtAmount(currentInvoice.debt);
        setInvoiceDeadline(currentInvoice.deadline);
        setDebtStatus(currentInvoice.status === "paid" ? "Đã hoàn thành" : currentInvoice.status === "overdue" ? "Quá hạn" : "Chưa đóng");
      }
    }).catch(console.error);

    // Fetch upcoming schedules
    apiCall(`/student/timetable?studentId=${user.id}`).then(data => {
      setTimetable(data);
    }).catch(console.error);
  }, [user.id]);

  return (
    <div>
      <Breadcrumb items={[{ label: "Tổng quan" }]} />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Xin chào, {user.name}!</h1>
        <p className="text-sm text-gray-500 mt-1">MSSV: {user.id} · Lớp: {user.className} · Khoa: {user.department}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tín chỉ đã đăng ký", value: `${registeredCredits} TC`, sub: "Giới hạn: 25 TC", color: "text-blue-600", bg: "bg-blue-50", icon: BookOpen },
          { label: "Trạng thái học phí", value: debtStatus, sub: "HK2 2025-2026", color: debtStatus === "Đã hoàn thành" ? "text-green-600" : "text-red-600", bg: debtStatus === "Đã hoàn thành" ? "bg-green-50" : "bg-red-50", icon: CreditCard },
          { label: "Công nợ hiện tại", value: `${debtAmount.toLocaleString("vi-VN")}₫`, sub: `Hạn: ${invoiceDeadline}`, color: debtAmount > 0 ? "text-amber-600" : "text-gray-500", bg: "bg-amber-50", icon: AlertCircle },
          { label: "Lớp đã đăng ký", value: `${registeredCount} lớp`, sub: "Học kỳ này", color: "text-green-600", bg: "bg-green-50", icon: Calendar },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="p-4 bg-white">
              <div className="flex items-start justify-between bg-white">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                </div>
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg">
            <h3 className="font-semibold text-gray-900 text-sm">Lịch học sắp tới</h3>
          </div>
          <div className="divide-y divide-gray-50 bg-white rounded-b-lg">
            {timetable.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Chưa có lịch học được đăng ký.</div>
            ) : (
              timetable.slice(0, 4).map((t, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Thứ {t.day}, Tiết {t.period} · {t.room} · {t.lecturer}</p>
                  </div>
                  {t.makeup && <Badge variant="warning">Bù</Badge>}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg">
            <h3 className="font-semibold text-gray-900 text-sm">Thông báo hệ thống</h3>
          </div>
          <div className="divide-y divide-gray-50 bg-white rounded-b-lg">
            {[
              { title: "Đợt đăng ký tín chỉ chính thức HK2 2025-2026 đang mở", time: "Vừa xong", type: "info" as const },
              { title: "Vui lòng hoàn thành học phí quá hạn học kỳ cũ nếu có", time: "1 giờ trước", type: "warning" as const },
              { title: "Phòng máy A1-305 đã nâng cấp máy tính mới", time: "2 ngày trước", type: "success" as const },
            ].map((n, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 bg-white">
                <div className="mt-0.5"><Badge variant={n.type}>&nbsp;</Badge></div>
                <div>
                  <p className="text-sm text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Course Search ────────────────────────────────────────────────────────────

function CourseSearch() {
  const [semester, setSemester] = useState("HK2 2025-2026");
  const [keyword, setKeyword] = useState("");
  const [dept, setDept] = useState("Tất cả");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const fetchClasses = () => {
    setLoading(true);
    apiCall(`/student/classes/open?keyword=${keyword}&department=${dept}`)
      .then(data => {
        setResults(data);
        setPage(1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
  }, [dept]);

  return (
    <div>
      <Breadcrumb items={[{ label: "Tra cứu lớp học phần" }]} />
      <h1 className="text-xl font-bold text-gray-900 mb-5">Tra cứu lớp học phần</h1>

      <Card className="p-4 mb-5 bg-white">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Học kỳ</label>
            <select value={semester} onChange={e => setSemester(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="HK2 2025-2026">HK2 2025-2026</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">Từ khóa</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Mã lớp HP, tên môn học, giảng viên..."
                onKeyDown={e => e.key === "Enter" && fetchClasses()}
                className="border border-gray-300 rounded pl-9 pr-3 py-2 text-sm w-full bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Khoa</label>
            <select value={dept} onChange={e => setDept(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <Btn onClick={fetchClasses} disabled={loading}>
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />} Tìm kiếm
          </Btn>
          <Btn variant="secondary" onClick={() => { setKeyword(""); setDept("Tất cả"); }}>
            <RefreshCw size={14} /> Đặt lại
          </Btn>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-lg">
          <span className="text-sm font-medium text-gray-700 bg-white">Kết quả: <span className="text-blue-600 font-semibold">{results.length}</span> lớp học phần</span>
        </div>
        {results.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-b-lg">
            <Search size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Không tìm thấy lớp học phần phù hợp.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-b-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                    {["Mã lớp HP", "Tên môn học", "Số TC", "Giảng viên", "Lịch học", "Phòng", "Sĩ số"].map(h => (
                      <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.subject}</td>
                      <td className="px-4 py-3 text-center">{c.credits}</td>
                      <td className="px-4 py-3 text-gray-700">{c.lecturer}</td>
                      <td className="px-4 py-3 text-gray-600">{c.schedule}</td>
                      <td className="px-4 py-3 text-gray-600">{c.room}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${c.enrolled >= c.max ? "text-red-600" : c.enrolled / c.max > 0.8 ? "text-amber-600" : "text-gray-700"}`}>
                          {c.enrolled}/{c.max}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={results.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

// ─── Course Registration ──────────────────────────────────────────────────────

function CourseRegistration({ user, addToast }: { user: User; addToast: (t: Omit<Toast, "id">) => void }) {
  const [registered, setRegistered] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [quickCode, setQuickCode] = useState("");
  const [keyword, setKeyword] = useState("");
  const [dept, setDept] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState(false);
  const PAGE_SIZE = 5;

  const totalCredits = registered.reduce((s, c) => s + c.credits, 0);
  const totalFee = registered.reduce((s, c) => s + c.fee, 0);
  const MAX_CREDITS = 25;

  const fetchRegistered = () => {
    apiCall(`/student/registrations?studentId=${user.id}`)
      .then(setRegistered)
      .catch(console.error);
  };

  const fetchAvailable = () => {
    apiCall(`/student/classes/open?keyword=${keyword}&department=${dept}`)
      .then(data => {
        // Filter out registered classes
        const registeredIds = registered.map(r => r.id);
        const filtered = data.filter((c: any) => !registeredIds.includes(c.id));
        setAvailable(filtered);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRegistered();
  }, [user.id]);

  useEffect(() => {
    fetchAvailable();
  }, [registered, dept]);

  const register = async (classCode: string) => {
    try {
      const res = await apiCall("/student/registrations", {
        method: "POST",
        body: JSON.stringify({ studentId: user.id, classCode }),
      });
      addToast({ type: "success", message: res.message || "Đăng ký thành công." });
      fetchRegistered();
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
    }
  };

  const unregister = async (classCode: string) => {
    try {
      const res = await apiCall(`/student/registrations?studentId=${user.id}&classCode=${classCode}`, {
        method: "DELETE",
      });
      addToast({ type: "warning", message: res.message || "Đã hủy đăng ký học phần." });
      fetchRegistered();
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
    }
  };

  const quickRegister = () => {
    if (!quickCode.trim()) return;
    register(quickCode.trim());
    setQuickCode("");
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Đăng ký tín chỉ" }]} />

      {/* Info bar */}
      <div className="flex items-center gap-4 mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex-1">
          <span className="text-sm font-semibold text-blue-900">{user.name}</span>
          <span className="text-blue-600 mx-2">·</span>
          <span className="text-sm text-blue-700 font-medium">MSSV: {user.id}</span>
          <span className="text-blue-600 mx-2">·</span>
          <span className="text-sm text-blue-700 font-medium">HK2 2025-2026</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-blue-900 font-medium">
            Tín chỉ đã ĐK: <span className={`font-bold text-lg ${totalCredits > MAX_CREDITS - 3 ? "text-amber-600" : "text-blue-600"}`}>{totalCredits}</span>
            <span className="text-blue-500 font-normal">/{MAX_CREDITS} TC</span>
          </div>
          <Badge variant="success">ĐANG MỞ</Badge>
        </div>
      </div>

      {/* Quick register */}
      <Card className="p-4 mb-4 bg-white">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-gray-700">Đăng ký nhanh theo mã lớp HP</label>
            <input value={quickCode} onChange={e => setQuickCode(e.target.value)} placeholder="VD: CNTT001.1"
              onKeyDown={e => e.key === "Enter" && quickRegister()}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
          </div>
          <Btn onClick={quickRegister}><Plus size={14} /> Đăng ký</Btn>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Khoa</label>
            <select value={dept} onChange={e => setDept(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <label className="text-sm font-medium text-gray-700">Tìm kiếm môn học</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tên môn, mã lớp..."
                onKeyDown={e => e.key === "Enter" && fetchAvailable()}
                className="border border-gray-300 rounded pl-8 pr-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Available classes */}
      <Card className="mb-5">
        <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg">
          <h3 className="font-semibold text-sm text-gray-900 bg-white">Danh sách lớp học phần có thể đăng ký</h3>
        </div>
        <div className="overflow-x-auto bg-white rounded-b-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["Mã lớp HP", "Tên môn học", "TC", "Giảng viên", "Lịch học", "Phòng", "Sĩ số", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {available.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => {
                const full = c.enrolled >= c.max;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.subject}</td>
                    <td className="px-4 py-3 text-center">{c.credits}</td>
                    <td className="px-4 py-3 text-gray-600">{c.lecturer}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.schedule}</td>
                    <td className="px-4 py-3 text-gray-600">{c.room}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${full ? "text-red-600" : c.enrolled / c.max > 0.8 ? "text-amber-600" : "text-gray-700"}`}>
                        {c.enrolled}/{c.max}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {full ? (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs bg-gray-100 text-gray-400 rounded cursor-not-allowed border border-gray-200">Đã đầy</span>
                      ) : (
                        <Btn size="sm" onClick={() => register(c.id)}><Plus size={13} /> Đăng ký</Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
              {available.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Không có lớp học phần khả dụng.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={available.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {/* Registered cart */}
      <Card className="mb-4">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-lg">
          <h3 className="font-semibold text-sm text-gray-900 bg-white">Giỏ đăng ký ({registered.length} lớp · {totalCredits} TC)</h3>
        </div>
        <div className="overflow-x-auto bg-white rounded-b-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["Mã lớp HP", "Tên môn học", "TC", "Lịch học", "Phòng", "Học phí tạm tính", "Trạng thái", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {registered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.subject}</td>
                  <td className="px-4 py-3 text-center">{c.credits}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.schedule}</td>
                  <td className="px-4 py-3 text-gray-600">{c.room}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{c.fee.toLocaleString("vi-VN")}₫</td>
                  <td className="px-4 py-3"><Badge variant="success">Thành công</Badge></td>
                  <td className="px-4 py-3">
                    <Btn variant="danger" size="sm" onClick={() => unregister(c.id)}><X size={13} /> Hủy</Btn>
                  </td>
                </tr>
              ))}
              {registered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Chưa có lớp nào trong giỏ đăng ký.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {registered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end bg-white">
            <span className="text-sm text-gray-600 mr-2 font-medium">Tổng học phí tạm tính:</span>
            <span className="text-lg font-bold text-blue-600">{totalFee.toLocaleString("vi-VN")}₫</span>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Btn variant="secondary" onClick={fetchRegistered}><RefreshCw size={14} /> Tải lại danh sách</Btn>
        <Btn variant="success" onClick={() => setConfirmModal(true)} disabled={registered.length === 0}>
          <Check size={14} /> Xác nhận kết quả đăng ký
        </Btn>
      </div>

      <Modal open={confirmModal} onClose={() => setConfirmModal(false)} title="Xác nhận đăng ký học phần"
        footer={<>
          <Btn variant="secondary" onClick={() => setConfirmModal(false)}>Hủy</Btn>
          <Btn onClick={() => {
            if (totalCredits < 12) {
              addToast({ type: "error", message: "Xác nhận thất bại: Số tín chỉ đăng ký chưa đạt mức tối thiểu (12 TC)." });
              return;
            }
            setConfirmModal(false);
            addToast({ type: "success", message: "Đăng ký tín chỉ chính thức đã được ghi nhận!" });
          }} disabled={totalCredits < 12}>
            <Check size={14} /> Xác nhận
          </Btn>
        </>}>
        <p className="text-sm text-gray-700 mb-4">Bạn đang xác nhận đăng ký <strong>{registered.length} lớp học phần</strong> với tổng <strong>{totalCredits} tín chỉ</strong>.</p>
        
        {totalCredits < 12 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-start gap-2 mb-4">
            <XCircle size={15} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800 font-medium">
              <strong>Không thể xác nhận:</strong> Tổng số tín chỉ đăng ký học kỳ chính ({totalCredits} TC) chưa đạt mức tối thiểu quy định (12 tín chỉ). Vui lòng đăng ký thêm môn học.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-start gap-2 mb-4">
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">Vui lòng hoàn thành học phí <strong>{totalFee.toLocaleString("vi-VN")}₫</strong> theo đúng thời hạn quy định.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Timetable ────────────────────────────────────────────────────────────────

function Timetable({ user }: { user: User }) {
  const [week, setWeek] = useState("Tuần 1 (07/09 - 13/09/2026)");
  const [data, setData] = useState<any[]>([]);
  const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const PERIODS = ["1-3", "4-6", "7-9", "10-12"];

  useEffect(() => {
    apiCall(`/student/timetable?studentId=${user.id}`)
      .then(setData)
      .catch(console.error);
  }, [user.id]);

  const getCell = (day: number, period: string) => data.find(d => d.day === day && d.period === period);

  return (
    <div>
      <Breadcrumb items={[{ label: "Thời khóa biểu" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Thời khóa biểu cá nhân</h1>
        <div className="flex items-center gap-3">
          <select value={week} onChange={e => setWeek(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option value="Tuần 1 (07/09 - 13/09/2026)">Tuần 1 (07/09 - 13/09/2026)</option>
          </select>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-orange-400 bg-orange-50 inline-block" />Lịch học bù</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" />Lịch học thường</span>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-r border-gray-200">Tiết học</th>
              {DAYS.map(d => (
                <th key={d} className="px-3 py-3 text-center text-xs font-medium text-gray-700 bg-gray-50 border-b border-r border-gray-200 min-w-[140px]">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period} className="border-b border-gray-100">
                <td className="px-3 py-2 text-xs text-gray-500 font-medium bg-gray-50 border-r border-gray-200 text-center">
                  Tiết {period}
                </td>
                {[2, 3, 4, 5, 6, 7].map(day => {
                  const cell = getCell(day, period);
                  return (
                    <td key={day} className="px-2 py-2 border-r border-gray-100 align-top h-20 bg-white">
                      {cell ? (
                        <div className={`h-full rounded p-2 border ${cell.color} ${cell.makeup ? "border-dashed border-2 border-orange-400" : ""}`}>
                          {cell.makeup && <span className="text-[10px] font-bold text-orange-700 bg-orange-200 px-1 py-0.5 rounded mb-1 inline-block">Lịch học bù</span>}
                          <div className="text-xs font-semibold leading-tight">{cell.subject}</div>
                          <div className="text-[11px] mt-1 opacity-75">{cell.room}</div>
                          <div className="text-[10px] opacity-60 truncate">{cell.lecturer}</div>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Tuition ──────────────────────────────────────────────────────────────────

function Tuition({ user, addToast }: { user: User; addToast: (t: Omit<Toast, "id">) => void }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [payMethod, setPayMethod] = useState("vnpay");

  const loadData = () => {
    apiCall(`/student/invoices?studentId=${user.id}`).then(data => {
      setInvoices(data);
      if (data.length > 0 && !selectedInvoice) {
        setSelectedInvoice(data[0]);
      }
    }).catch(console.error);

    apiCall(`/student/payment-receipts?studentId=${user.id}`).then(setReceipts).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  useEffect(() => {
    if (selectedInvoice) {
      apiCall(`/student/invoices/${selectedInvoice.invoiceId}/breakdown`)
        .then(setBreakdown)
        .catch(console.error);
    }
  }, [selectedInvoice]);

  const handlePay = async () => {
    if (!selectedInvoice) return;
    setPaymentModal(false);
    try {
      const res = await apiCall("/student/pay", {
        method: "POST",
        body: JSON.stringify({ invoiceId: selectedInvoice.invoiceId, amount: selectedInvoice.debt }),
      });
      // Redirect to simulated checkout page
      window.location.href = res.paymentUrl;
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
    }
  };

  const statusMap: Record<string, { label: string; variant: "success" | "error" | "warning" }> = {
    paid: { label: "Đã hoàn thành", variant: "success" },
    unpaid: { label: "Chưa đóng", variant: "error" },
    overdue: { label: "Quá hạn", variant: "warning" },
    partially_paid: { label: "Đóng một phần", variant: "warning" }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Công nợ học phí" }]} />
      <h1 className="text-xl font-bold text-gray-900 mb-5">Công nợ học phí</h1>

      {/* A - Invoice summary */}
      <Card className="mb-5">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
          <h3 className="font-semibold text-sm text-gray-900 bg-white">Tổng hợp học phí theo học kỳ</h3>
          <Btn variant="secondary" size="sm" onClick={loadData}><RefreshCw size={13} /></Btn>
        </div>
        <div className="overflow-x-auto bg-white rounded-b-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["Học kỳ", "Mã hóa đơn", "Học phí phải nộp", "Đã thanh toán", "Còn nợ", "Hạn đóng", "Trạng thái", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {invoices.map(inv => {
                const s = statusMap[inv.status] || { label: inv.status, variant: "default" as const };
                const isSelected = selectedInvoice?.invoiceId === inv.invoiceId;
                return (
                  <tr key={inv.invoiceId} onClick={() => setSelectedInvoice(inv)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? "bg-blue-50/50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{inv.semester}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{inv.invoiceId}</td>
                    <td className="px-4 py-3 font-medium">{inv.required.toLocaleString("vi-VN")}₫</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{inv.paid.toLocaleString("vi-VN")}₫</td>
                    <td className={`px-4 py-3 font-bold ${inv.debt > 0 ? "text-red-600" : inv.debt < 0 ? "text-blue-600" : "text-green-600"}`}>{inv.debt.toLocaleString("vi-VN")}₫</td>
                    <td className="px-4 py-3 text-gray-600">{inv.deadline}</td>
                    <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {inv.debt > 0 && (
                        <Btn size="sm" onClick={() => { setSelectedInvoice(inv); setPaymentModal(true); }}>
                          <CreditCard size={13} /> Thanh toán
                        </Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Không có hóa đơn học phí nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* B - Breakdown */}
      {selectedInvoice && (
        <Card className="mb-5">
          <div className="px-4 py-3 border-b border-gray-100 bg-white">
            <h3 className="font-semibold text-sm text-gray-900 bg-white">Chi tiết học phí học phần: {selectedInvoice.semester}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                  {["Mã lớp HP", "Tên môn học", "Số TC", "Đơn giá/TC", "Thành tiền"].map(h => (
                    <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {breakdown.map(row => (
                  <tr key={row.classId} className="hover:bg-gray-50 transition-colors bg-white">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{row.classId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.subject}</td>
                    <td className="px-4 py-3 text-center">{row.credits}</td>
                    <td className="px-4 py-3">{row.unitPrice.toLocaleString("vi-VN")}₫</td>
                    <td className="px-4 py-3 font-semibold">{row.total.toLocaleString("vi-VN")}₫</td>
                  </tr>
                ))}
                {breakdown.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Không có chi tiết lớp học trong học kỳ này (đăng ký cũ).</td></tr>
                )}
              </tbody>
              {breakdown.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td colSpan={4} className="px-4 py-2.5 text-right font-semibold text-gray-700">Tổng cộng:</td>
                    <td className="px-4 py-2.5 font-bold text-blue-600 text-base">
                      {breakdown.reduce((s, r) => s + r.total, 0).toLocaleString("vi-VN")}₫
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      )}

      {/* D - Transaction history */}
      <Card>
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <h3 className="font-semibold text-sm text-gray-900">Lịch sử giao dịch</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["Mã biên lai", "Mã giao dịch", "Ngày GD", "Số tiền", "Phương thức", "Kết quả"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {receipts.map(t => (
                <tr key={t.receiptId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{t.receiptId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{t.code}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3 font-semibold">{t.amount.toLocaleString("vi-VN")}₫</td>
                  <td className="px-4 py-3"><Badge variant="info">{t.method}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={t.result === "success" ? "success" : "error"}>
                      {t.result === "success" ? "Thành công" : "Thất bại"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chưa có giao dịch thanh toán nào được thực hiện.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* C - Payment modal */}
      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="Thanh toán học phí trực tuyến"
        footer={<>
          <Btn variant="secondary" onClick={() => setPaymentModal(false)}>Hủy</Btn>
          <Btn onClick={handlePay}>
            <Check size={14} /> Kết nối cổng thanh toán
          </Btn>
        </>}>
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Mã hóa đơn:</span><span className="font-mono font-semibold text-blue-700">{selectedInvoice.invoiceId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Học kỳ:</span><span className="font-medium">{selectedInvoice.semester}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2"><span className="text-gray-700 font-medium">Số tiền cần thanh toán:</span><span className="text-lg font-bold text-blue-600">{selectedInvoice.debt.toLocaleString("vi-VN")}₫</span></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</p>
              {[{ id: "vnpay", label: "Cổng VNPAY (Simulator)", desc: "Mô phỏng thanh toán thẻ ATM / QR code qua VNPAY" }].map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border mb-2 cursor-pointer transition-all ${payMethod === m.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="payMethod" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-blue-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{m.label}</div>
                    <div className="text-xs text-gray-500">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Personal Info ────────────────────────────────────────────────────────────

function PersonalInfo({ user }: { user: User }) {
  return (
    <div>
      <Breadcrumb items={[{ label: "Thông tin cá nhân" }]} />
      <h1 className="text-xl font-bold text-gray-900 mb-5">Thông tin cá nhân</h1>
      <div className="grid grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold mb-3">
            {user.name.split(" ").slice(-1)[0].charAt(0)}
          </div>
          <h2 className="font-semibold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Mã số: {user.id}</p>
          <Badge variant="info" className="mt-2">Đang hoạt động</Badge>
        </Card>
        <Card className="col-span-2 p-5 bg-white">
          <h3 className="font-semibold text-gray-900 mb-4">Thông tin học vụ chi tiết</h3>
          <div className="grid grid-cols-2 gap-4 text-sm bg-white">
            {[
              ["Họ và tên", user.name], ["Ngày sinh", "15/03/2004"],
              ["Mã số sinh viên", user.id], ["Lớp sinh hoạt", user.className || "N/A"],
              ["Khoa phụ trách", user.department], ["Ngành học", "Khoa học máy tính & CNTT"],
              ["Bậc đào tạo", "Đại học"], ["Hệ đào tạo", "Chính quy"],
              ["Email trường", `${user.id}@student.edu.vn`], ["Số điện thoại", "0901 234 567"],
              ["Địa chỉ liên hệ", "123 Võ Văn Ngân, Thủ Đức, TP.HCM"], ["Niên khóa", "2022-2026"],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-gray-50 pb-1.5">
                <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                <p className="font-semibold text-gray-950">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Lecturer Dashboard ───────────────────────────────────────────────────────

function LecturerDashboard({ user }: { user: User }) {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    apiCall(`/lecturer/timetable?lecturerId=${user.id}`)
      .then(setClasses)
      .catch(console.error);
  }, [user.id]);

  const totalStudents = classes.reduce((s, c) => s + c.students, 0);

  return (
    <div>
      <Breadcrumb items={[{ label: "Tổng quan" }]} />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Xin chào, {user.name}!</h1>
        <p className="text-sm text-gray-500 mt-1">Mã GV: {user.id} · Khoa {user.department} · HK2 2025-2026</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Lớp đang giảng dạy", value: `${classes.length} lớp`, color: "text-blue-600", bg: "bg-blue-50", icon: BookOpen },
          { label: "Tổng sinh viên", value: `${totalStudents} SV`, color: "text-green-600", bg: "bg-green-50", icon: Users },
          { label: "Tiết dạy/tuần", value: `${classes.length * 3} tiết`, color: "text-purple-600", bg: "bg-purple-50", icon: Clock },
          { label: "Lịch bù học kỳ", value: "0 buổi", color: "text-amber-600", bg: "bg-amber-50", icon: Calendar },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card>
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <h3 className="font-semibold text-sm text-gray-900">Lớp đang giảng dạy</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["Mã lớp HP", "Tên môn học", "Lịch học", "Phòng", "Sĩ số"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {classes.map(c => (
                <tr key={c.classId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.classId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.subject}</td>
                  <td className="px-4 py-3 text-gray-600">{c.schedule}</td>
                  <td className="px-4 py-3 text-gray-600">{c.room}</td>
                  <td className="px-4 py-3"><span className="font-semibold text-gray-800">{c.students}</span> <span className="text-gray-400">SV</span></td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Không có lớp giảng dạy nào được phân công.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TeachingSchedule({ user }: { user: User }) {
  const [classes, setClasses] = useState<any[]>([]);
  const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const PERIODS = ["1-3", "4-6", "7-9", "10-12"];

  useEffect(() => {
    apiCall(`/lecturer/timetable?lecturerId=${user.id}`)
      .then(setClasses)
      .catch(console.error);
  }, [user.id]);

  const getCell = (day: number, period: string) => classes.find(d => d.day === day && d.period === period);

  return (
    <div>
      <Breadcrumb items={[{ label: "Lịch giảng dạy" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Lịch giảng dạy tuần</h1>
        <span className="text-sm text-gray-500 font-medium">Học kỳ II 2025-2026</span>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr>
              <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-r border-gray-200">Tiết học</th>
              {DAYS.map(d => <th key={d} className="px-3 py-3 text-center text-xs font-medium text-gray-700 bg-gray-50 border-b border-r border-gray-200 min-w-[140px]">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period} className="border-b border-gray-100">
                <td className="px-3 py-2 text-xs text-gray-500 font-medium bg-gray-50 border-r border-gray-200 text-center">Tiết {period}</td>
                {[2, 3, 4, 5, 6, 7].map(day => {
                  const cell = getCell(day, period);
                  return (
                    <td key={day} className="px-2 py-2 border-r border-gray-100 align-top h-20 bg-white">
                      {cell ? (
                        <div className={`h-full rounded p-2 border ${cell.color}`}>
                          <div className="text-xs font-semibold leading-tight">{cell.subject}</div>
                          <div className="text-[11px] mt-1 font-mono opacity-75">{cell.classId}</div>
                          <div className="text-[11px] opacity-75">{cell.room}</div>
                          <div className="text-[10px] opacity-60">{cell.students} SV</div>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function ClassManagement({ user, addToast }: { user: User; addToast: (t: Omit<Toast, "id">) => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [studentList, setStudentList] = useState<any[]>([]);

  useEffect(() => {
    apiCall(`/lecturer/timetable?lecturerId=${user.id}`).then(data => {
      // deduplicate by classId
      const uniqueClasses: any[] = [];
      const map = new Map();
      for (const item of data) {
        if (!map.has(item.classId)) {
          map.set(item.classId, true);
          uniqueClasses.push({ id: item.classId, name: item.subject, students: item.enrolled });
        }
      }
      setClasses(uniqueClasses);
      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0].id);
      }
    }).catch(console.error);
  }, [user.id]);

  useEffect(() => {
    if (selectedClass) {
      apiCall(`/lecturer/classes/${selectedClass}/students`)
        .then(setStudentList)
        .catch(console.error);
    }
  }, [selectedClass]);

  const cls = classes.find(c => c.id === selectedClass) || { name: "", id: "", students: 0 };

  return (
    <div>
      <Breadcrumb items={[{ label: "Quản lý lớp giảng dạy" }]} />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Danh sách sinh viên</h1>
          <p className="text-sm text-gray-500 mt-1">{cls.name} · {selectedClass} · {cls.students} sinh viên đã đăng ký</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            {classes.map(c => <option key={c.id} value={c.id}>{c.id} - {c.name}</option>)}
          </select>
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto bg-white rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["STT", "MSSV", "Họ và tên", "Ngày sinh", "Lớp sinh hoạt", "Email"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {studentList.map(s => (
                <tr key={s.mssv} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{s.stt}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{s.mssv}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.dob}</td>
                  <td className="px-4 py-3"><Badge variant="default">{s.class}</Badge></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.email}</td>
                </tr>
              ))}
              {studentList.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Không có sinh viên nào trong lớp này.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Registrar Dashboard ──────────────────────────────────────────────────────

function RegistrarDashboard() {
  const [finance, setFinance] = useState<any>({ totalCredits: 0, totalTuition: 0, totalPaid: 0, fillRates: [] });
  const [lowClasses, setLowClasses] = useState<any[]>([]);

  const loadReport = () => {
    apiCall("/registrar/reports/finance").then(setFinance).catch(console.error);
    apiCall("/registrar/reports/enrolled").then(setLowClasses).catch(console.error);
  };

  useEffect(() => {
    loadReport();
  }, []);

  const stats = [
    { label: "Môn học có sẵn", value: "8 môn", sub: "Trong catalog", color: "text-blue-600", bg: "bg-blue-50", icon: BookOpen },
    { label: "Tín chỉ đã ĐK", value: `${finance.totalCredits} TC`, sub: "Học kỳ này", color: "text-purple-600", bg: "bg-purple-50", icon: Users },
    { label: "Tổng học phí dự tính", value: `${finance.totalTuition.toLocaleString("vi-VN")}₫`, sub: "Dựa trên TC", color: "text-amber-600", bg: "bg-amber-50", icon: CreditCard },
    { label: "Học phí đã thu", value: `${finance.totalPaid.toLocaleString("vi-VN")}₫`, sub: "Qua VNPAY", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Tổng quan" }]} />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển Phòng Đào tạo (Registrar)</h1>
          <p className="text-sm text-gray-500 mt-1">HK2 2025-2026 · Hệ thống kết nối cơ sở dữ liệu H2</p>
        </div>
        <Btn variant="secondary" onClick={loadReport}><RefreshCw size={14} /></Btn>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="p-4 bg-white">
              <div className="flex items-start justify-between bg-white">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                </div>
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg"><h3 className="font-semibold text-sm">Lớp sĩ số thấp (&lt;15 SV) cần giám sát</h3></div>
          <div className="divide-y divide-gray-50 bg-white rounded-b-lg">
            {lowClasses.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">Không có lớp học phần nào dưới sĩ số tối thiểu.</div>
            ) : (
              lowClasses.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 bg-white">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.id} — {c.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Giảng viên: {c.lecturer} · Sĩ số: {c.enrolled}/{c.min} (tối thiểu)</p>
                  </div>
                  <Badge variant={c.status === "cancel" ? "error" : "warning"}>
                    {c.status === "cancel" ? "Đã hủy lớp" : "Dưới min (Cần theo dõi)"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg"><h3 className="font-semibold text-sm">Tỷ lệ lấp đầy lớp HP (%)</h3></div>
          <div className="p-4 bg-white rounded-b-lg">
            {finance.fillRates && finance.fillRates.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={finance.fillRates} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9CA3AF" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                    {finance.fillRates.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.rate >= 100 ? "#DC2626" : entry.rate > 80 ? "#F59E0B" : "#2563EB"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-sm text-gray-400">Chưa có dữ liệu thống kê lấp đầy.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Course Catalog Management ────────────────────────────────────────────────

function CourseCatalog({ addToast }: { addToast: (t: Omit<Toast, "id">) => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ id: "", name: "", credits: "3", dept: "CNTT", prereq: "—" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const loadCourses = () => {
    apiCall("/registrar/subjects").then(setCourses).catch(console.error);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filtered = courses.filter(c => c.id.toLowerCase().includes(keyword.toLowerCase()) || c.name.toLowerCase().includes(keyword.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ id: "", name: "", credits: "3", dept: "CNTT", prereq: "—" }); setModal(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ id: c.id, name: c.name, credits: String(c.credits), dept: c.dept, prereq: c.prereq }); setModal(true); };

  const save = async () => {
    if (!form.id || !form.name) { addToast({ type: "error", message: "Vui lòng điền đầy đủ thông tin." }); return; }
    try {
      if (editing) {
        const res = await apiCall(`/registrar/subjects/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        addToast({ type: "success", message: res.message || `Đã cập nhật môn học ${form.id}.` });
      } else {
        const res = await apiCall("/registrar/subjects", {
          method: "POST",
          body: JSON.stringify(form),
        });
        addToast({ type: "success", message: res.message || `Đã thêm môn học ${form.id}.` });
      }
      setModal(false);
      loadCourses();
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const res = await apiCall(`/registrar/subjects/${id}`, { method: "DELETE" });
      addToast({ type: "success", message: res.message || `Đã xóa môn học ${id}.` });
      setDeleteConfirm(null);
      loadCourses();
    } catch (e: any) {
      // Failed to delete physically, suggest toggle inactive
      addToast({ type: "error", message: e.message });
      setDeleteConfirm(null);
      // Ask to set inactive
      if (window.confirm("Môn học này đã được sử dụng nên không thể xóa vật lý. Bạn có muốn chuyển trạng thái môn học sang ngưng hoạt động (INACTIVE)?")) {
        try {
          const statusRes = await apiCall(`/registrar/subjects/${id}/status?status=INACTIVE`, { method: "PATCH" });
          addToast({ type: "success", message: statusRes.message || "Đã chuyển trạng thái sang INACTIVE." });
          loadCourses();
        } catch (err: any) {
          addToast({ type: "error", message: err.message });
        }
      }
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Quản lý môn học" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Quản lý danh mục môn học</h1>
        <Btn onClick={openAdd}><Plus size={14} /> Thêm môn học mới</Btn>
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white rounded-t-lg">
          <div className="relative flex-1 max-w-xs bg-white">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm mã môn, tên môn..."
              className="border border-gray-300 rounded pl-8 pr-3 py-1.5 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" />
          </div>
          <span className="text-sm text-gray-500 bg-white">{filtered.length} môn học</span>
        </div>
        <div className="overflow-x-auto bg-white rounded-b-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["Mã môn", "Tên môn học", "Số TC", "Khoa", "Môn tiên quyết", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-center">{c.credits}</td>
                  <td className="px-4 py-3"><Badge variant="default">{c.dept}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 font-medium">{c.prereq}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "ACTIVE" ? "success" : "default"}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 bg-white">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
        footer={<>
          <Btn variant="secondary" onClick={() => setModal(false)}>Hủy</Btn>
          <Btn onClick={save}><Save size={14} /> {editing ? "Lưu thay đổi" : "Thêm môn học"}</Btn>
        </>}>
        <div className="space-y-4">
          <Input label="Mã môn học" value={form.id} onChange={v => setForm(f => ({ ...f, id: v }))} placeholder="VD: CNTT006" required />
          <Input label="Tên môn học" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="VD: Phát triển ứng dụng di động" required />
          <Select label="Số tín chỉ" value={form.credits} onChange={v => setForm(f => ({ ...f, credits: v }))}
            options={[1, 2, 3, 4, 5, 6].map(n => ({ value: String(n), label: `${n} tín chỉ` }))} required />
          <Select label="Khoa" value={form.dept} onChange={v => setForm(f => ({ ...f, dept: v }))}
            options={DEPARTMENTS.slice(1).map(d => ({ value: d, label: d }))} required />
          <Select label="Môn tiên quyết" value={form.prereq} onChange={v => setForm(f => ({ ...f, prereq: v }))}
            options={[{ value: "—", label: "Không có" }, ...courses.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))]} />
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Xác nhận xóa môn học"
        footer={<>
          <Btn variant="secondary" onClick={() => setDeleteConfirm(null)}>Hủy</Btn>
          <Btn variant="danger" onClick={() => deleteConfirm && deleteCourse(deleteConfirm)}><Trash2 size={14} /> Xóa</Btn>
        </>}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700">Bạn có chắc muốn xóa môn học <strong>{deleteConfirm}</strong>? Hành động này không thể hoàn tác.</p>
        </div>
      </Modal>
    </div>
  );
}

// ─── Class Offering Management ────────────────────────────────────────────────

function ClassOffering({ addToast }: { addToast: (t: Omit<Toast, "id">) => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    semester: "HK2 2025-2026", subjectId: "CNTT001", classCode: "CNTT001.2",
    minStudents: "15", maxStudents: "50", dayOfWeek: "2",
    startPeriod: "1", endPeriod: "3", roomName: "A201", lecturerId: "GV001"
  });
  const [conflict, setConflict] = useState("");
  const [checking, setChecking] = useState(false);
  const [classToCancel, setClassToCancel] = useState<string | null>(null);

  const loadData = () => {
    apiCall("/registrar/classes").then(setClasses).catch(console.error);
    apiCall("/registrar/subjects").then(setSubjects).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const f = (k: string, v: string) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      // Auto-generate classCode based on subjectId and sequence
      if (k === "subjectId") {
        const seq = classes.filter((c: any) => c.id.startsWith(v)).length + 1;
        next.classCode = `${v}.${seq}`;
      }
      return next;
    });
  };

  const save = async () => {
    try {
      const res = await apiCall("/registrar/classes", {
        method: "POST",
        body: JSON.stringify(form),
      });
      addToast({ type: "success", message: res.message || "Thiết lập lớp học phần thành công." });
      setConflict("");
      loadData();
    } catch (e: any) {
      setConflict(e.message);
      addToast({ type: "error", message: e.message });
    }
  };

  const cancelClass = (classCode: string) => {
    setClassToCancel(classCode);
  };

  const confirmCancelClass = async () => {
    if (!classToCancel) return;
    try {
      const res = await apiCall(`/registrar/classes/${classToCancel}/cancel`, { method: "POST" });
      addToast({ type: "success", message: res.message || "Đã hủy lớp học phần." });
      setClassToCancel(null);
      loadData();
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
      setClassToCancel(null);
    }
  };

  const deleteClass = async (classCode: string) => {
    try {
      const res = await apiCall(`/registrar/classes/${classCode}`, { method: "DELETE" });
      addToast({ type: "success", message: res.message || "Đã xóa lớp học phần." });
      loadData();
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Mở lớp học phần" }]} />
      <h1 className="text-xl font-bold text-gray-900 mb-5">Mở lớp học phần mới</h1>

      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="col-span-2">
          <Card className="p-5 bg-white">
            <h3 className="font-semibold text-gray-900 mb-4 bg-white">Cấu hình lớp học phần</h3>
            <div className="grid grid-cols-2 gap-4 bg-white">
              <Select label="Học kỳ" value={form.semester} onChange={v => f("semester", v)}
                options={[{ value: "HK2 2025-2026", label: "HK2 2025-2026" }]} required />
              <Select label="Môn học" value={form.subjectId} onChange={v => f("subjectId", v)}
                options={subjects.filter(s => s.status === "ACTIVE").map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))} required />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Mã lớp HP <span className="text-xs text-gray-400">(tự sinh)</span></label>
                <input value={form.classCode} readOnly className="border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-2 bg-white">
                <Input label="Sĩ số tối thiểu" value={form.minStudents} onChange={v => f("minStudents", v)} placeholder="15" />
                <Input label="Sĩ số tối đa" value={form.maxStudents} onChange={v => f("maxStudents", v)} placeholder="50" />
              </div>
              <Select label="Thứ trong tuần" value={form.dayOfWeek} onChange={v => f("dayOfWeek", v)}
                options={[2, 3, 4, 5, 6, 7].map(d => ({ value: String(d), label: `Thứ ${d}` }))} required />
              <div className="grid grid-cols-2 gap-2 bg-white">
                <Select label="Tiết bắt đầu" value={form.startPeriod} onChange={v => f("startPeriod", v)}
                  options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tiết ${i + 1}` }))} />
                <Select label="Tiết kết thúc" value={form.endPeriod} onChange={v => f("endPeriod", v)}
                  options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tiết ${i + 1}` }))} />
              </div>
              <Select label="Phòng học" value={form.roomName} onChange={v => f("roomName", v)}
                options={[
                  { value: "A201", label: "A201 (sức chứa: 50)" }, { value: "B305", label: "B305 (sức chứa: 50)" },
                  { value: "C102", label: "C102 (sức chứa: 40)" }, { value: "D101", label: "D101 (sức chứa: 60)" },
                  { value: "A1-305", label: "A1-305 (sức chứa: 60)" },
                ]} required />
              <Select label="Giảng viên" value={form.lecturerId} onChange={v => f("lecturerId", v)}
                options={[
                  { value: "GV001", label: "TS. Trần Minh Khoa" }, { value: "GV002", label: "ThS. Nguyễn Lan Anh" }
                ]} required />
            </div>

            {conflict && (
              <div className="mt-4 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={15} className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{conflict}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
              <Btn onClick={save}>
                <Save size={14} /> Lưu kế hoạch mở lớp
              </Btn>
              <Btn variant="ghost" onClick={() => setConflict("")}>Hủy bỏ</Btn>
            </div>
          </Card>
        </div>
        <div>
          <Card className="p-4 bg-white h-fit">
            <h4 className="font-semibold text-sm text-gray-900 mb-3 bg-white">Xem trước</h4>
            <div className="space-y-2 text-sm bg-white">
              {[
                ["Môn học ID", form.subjectId],
                ["Mã lớp HP", form.classCode], ["Sĩ số", `${form.minStudents}–${form.maxStudents} SV`],
                ["Khung thời gian", `Thứ ${form.dayOfWeek}, Tiết ${form.startPeriod}-${form.endPeriod}`],
                ["Phòng phân bổ", form.roomName], ["Mã giảng viên", form.lecturerId]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1 border-b border-gray-50 bg-white">
                  <span className="text-gray-500">{label}:</span>
                  <span className="font-medium text-gray-900 text-right">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg">
          <h3 className="font-semibold text-sm text-gray-900">Danh sách các lớp học phần hiện có</h3>
        </div>
        <div className="overflow-x-auto bg-white rounded-b-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["Mã lớp HP", "Tên môn học", "Số TC", "Giảng viên", "Lịch học", "Phòng", "Sĩ số", "Trạng thái", "Hành động"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {classes.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.subject}</td>
                  <td className="px-4 py-3 text-center">{c.credits}</td>
                  <td className="px-4 py-3 text-gray-700">{c.lecturer}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.schedule}</td>
                  <td className="px-4 py-3 text-gray-600">{c.room}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{c.enrolled}</span><span className="text-gray-400">/{c.max}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "cancelled" ? "error" : c.status === "open" ? "success" : "default"}>
                      {c.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 bg-white">
                      {c.enrolled < c.min && c.status !== "cancelled" && (
                        <Btn variant="danger" size="sm" onClick={() => cancelClass(c.id)}>Hủy lớp</Btn>
                      )}
                      {c.enrolled === 0 && (
                        <button onClick={() => deleteClass(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={classToCancel !== null}
        onClose={() => setClassToCancel(null)}
        title="Xác nhận hủy lớp học phần"
        footer={
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={() => setClassToCancel(null)}>Hủy bỏ</Btn>
            <Btn variant="danger" onClick={confirmCancelClass}>Xác nhận hủy</Btn>
          </div>
        }
      >
        <div className="flex items-start gap-3 bg-white">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700 bg-white">
            Bạn có chắc chắn muốn <strong>HỦY LỚP {classToCancel}</strong>?
            Hành động này sẽ gỡ lớp khỏi thời khóa biểu của tất cả sinh viên đã đăng ký và hoàn lại học phí tương ứng. Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ─── Registration Config ──────────────────────────────────────────────────────

function RegistrationConfig({ addToast }: { addToast: (t: Omit<Toast, "id">) => void }) {
  const [periods, setPeriods] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "Đợt 1 - Khóa CNTT K24",
    startTime: "2026-08-01T08:00",
    endTime: "2026-08-10T17:00",
    targetBatches: "K24,K23",
    targetDepartments: "CNTT",
  });

  const loadPeriods = () => {
    apiCall("/registrar/periods").then(setPeriods).catch(console.error);
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    try {
      const res = await apiCall("/registrar/periods", {
        method: "POST",
        body: JSON.stringify(form),
      });
      addToast({ type: "success", message: res.message || "Tạo đợt đăng ký thành công." });
      loadPeriods();
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
    }
  };

  const toggleStatus = async (id: number, status: string) => {
    try {
      const res = await apiCall(`/registrar/periods/${id}/status?status=${status}`, {
        method: "PATCH",
      });
      addToast({ type: "success", message: res.message || "Đã cập nhật trạng thái." });
      loadPeriods();
    } catch (e: any) {
      addToast({ type: "error", message: e.message });
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Cấu hình đợt đăng ký" }]} />
      <h1 className="text-xl font-bold text-gray-900 mb-5">Cấu hình đợt đăng ký tín chỉ</h1>

      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="col-span-2 space-y-4">
          <Card className="p-5 bg-white">
            <h3 className="font-semibold text-gray-900 mb-4 bg-white">Thiết lập đợt đăng ký mới</h3>
            <div className="grid grid-cols-2 gap-4 bg-white">
              <Input label="Tên đợt đăng ký" value={form.name} onChange={v => f("name", v)} required />
              <Input label="Khóa áp dụng (batches)" value={form.targetBatches} onChange={v => f("targetBatches", v)} placeholder="VD: K24,K23" required />
              <Input label="Khoa áp dụng (departments)" value={form.targetDepartments} onChange={v => f("targetDepartments", v)} placeholder="VD: CNTT,Điện tử" required />
              <div className="grid grid-cols-2 gap-2 bg-white">
                <Input label="Bắt đầu (ISO DateTime)" value={form.startTime} onChange={v => f("startTime", v)} placeholder="YYYY-MM-DDTHH:mm" required />
                <Input label="Kết thúc (ISO DateTime)" value={form.endTime} onChange={v => f("endTime", v)} placeholder="YYYY-MM-DDTHH:mm" required />
              </div>
            </div>
            <Btn className="mt-4" onClick={save}><Save size={14} /> Lưu cấu hình</Btn>
          </Card>
        </div>
        <Card className="p-4 bg-white h-fit">
          <h4 className="font-semibold text-sm text-gray-900 mb-3 bg-white">Xem trước cấu hình</h4>
          <div className="space-y-2 text-sm bg-white">
            {[
              ["Tên đợt", form.name],
              ["Bắt đầu", form.startTime.replace("T", " ")],
              ["Kết thúc", form.endTime.replace("T", " ")],
              ["Khóa SV", form.targetBatches],
              ["Khoa ngành", form.targetDepartments],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 py-1 border-b border-gray-50 bg-white">
                <span className="text-xs text-gray-400 bg-white">{label}</span>
                <span className="text-sm font-semibold text-gray-950 bg-white">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg">
          <h3 className="font-semibold text-sm text-gray-900">Danh sách các đợt đăng ký tín chỉ</h3>
        </div>
        <div className="overflow-x-auto bg-white rounded-b-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                {["ID", "Tên đợt đăng ký", "Thời gian bắt đầu", "Thời gian kết thúc", "Đối tượng", "Khoa", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {periods.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.startTime.replace("T", " ").substring(0, 16)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.endTime.replace("T", " ").substring(0, 16)}</td>
                  <td className="px-4 py-3 font-medium text-xs">{p.targetBatches}</td>
                  <td className="px-4 py-3 text-xs">{p.targetDepartments}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "OPEN" ? "success" : p.status === "CLOSED" ? "default" : "warning"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 bg-white">
                      {p.status !== "OPEN" && (
                        <Btn variant="primary" size="sm" onClick={() => toggleStatus(p.id, "OPEN")}>Mở cổng</Btn>
                      )}
                      {p.status === "OPEN" && (
                        <Btn variant="danger" size="sm" onClick={() => toggleStatus(p.id, "CLOSED")}>Đóng cổng</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function Reports({ addToast }: { addToast: (t: Omit<Toast, "id">) => void }) {
  const [semester, setSemester] = useState("HK2 2025-2026");
  const [reportType, setReportType] = useState("class-fill");
  const [running, setRunning] = useState(false);
  const [finance, setFinance] = useState<any>({ totalCredits: 0, totalTuition: 0, totalPaid: 0, fillRates: [] });
  const [lowClasses, setLowClasses] = useState<any[]>([]);

  const loadReport = () => {
    setRunning(true);
    setTimeout(() => {
      apiCall("/registrar/reports/finance").then(setFinance).catch(console.error);
      apiCall("/registrar/reports/enrolled").then(setLowClasses).catch(console.error);
      setRunning(false);
      addToast({ type: "success", message: "Báo cáo đã được cập nhật thành công." });
    }, 800);
  };

  useEffect(() => {
    loadReport();
  }, []);

  const summaryCards = [
    { label: "Tổng TC đã đăng ký", value: `${finance.totalCredits} TC`, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Doanh thu học phí ước tính", value: `${finance.totalTuition.toLocaleString("vi-VN")}₫`, color: "text-green-600", bg: "bg-green-50" },
    { label: "Thực thu qua VNPAY", value: `${finance.totalPaid.toLocaleString("vi-VN")}₫`, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Còn nợ học phí", value: `${(finance.totalTuition - finance.totalPaid).toLocaleString("vi-VN")}₫`, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Thống kê báo cáo" }]} />
      <h1 className="text-xl font-bold text-gray-900 mb-5">Thống kê & Báo cáo</h1>

      <Card className="p-4 mb-5 bg-white">
        <div className="flex items-end gap-3 flex-wrap bg-white">
          <Select label="Học kỳ" value={semester} onChange={setSemester}
            options={[{ value: "HK2 2025-2026", label: "HK2 2025-2026" }]} />
          <Select label="Loại báo cáo" value={reportType} onChange={setReportType}
            options={[
              { value: "class-fill", label: "Tỷ lệ lấp đầy lớp HP" },
            ]} />
          <Btn onClick={loadReport} disabled={running}>
            {running ? <><RefreshCw size={14} className="animate-spin" /> Đang chạy...</> : <><BarChart2 size={14} /> Chạy báo cáo</>}
          </Btn>
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {summaryCards.map((c, i) => (
          <Card key={i} className="p-4 bg-white">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-base font-bold ${c.color}`}>{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Under-minimum table */}
        <Card>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-lg">
            <h3 className="font-semibold text-sm text-gray-900">Lớp HP dưới sĩ số tối thiểu</h3>
            <Badge variant="error">{lowClasses.length} lớp</Badge>
          </div>
          <div className="overflow-x-auto bg-white rounded-b-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                  {["Mã lớp HP", "Tên môn", "GV", "Sĩ số", "Trạng thái"].map(h => (
                    <th key={h} className="px-3 py-2 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {lowClasses.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors bg-white">
                    <td className="px-3 py-2.5 font-mono text-xs text-blue-700 font-medium">{c.id}</td>
                    <td className="px-3 py-2.5 text-gray-900 text-xs font-semibold">{c.subject}</td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{c.lecturer}</td>
                    <td className="px-3 py-2.5 text-xs"><span className="font-bold text-red-600">{c.enrolled}</span><span className="text-gray-400">/{c.min}</span></td>
                    <td className="px-3 py-2.5"><Badge variant={c.status === "cancel" ? "error" : "warning"}>{c.status === "cancel" ? "Đã hủy" : "Cần giám sát"}</Badge></td>
                  </tr>
                ))}
                {lowClasses.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">Không có lớp sĩ số thấp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Fill rate chart */}
        <Card>
          <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-lg">
            <h3 className="font-semibold text-sm text-gray-900 bg-white">Tỷ lệ lấp đầy lớp học phần (%)</h3>
          </div>
          <div className="p-4 bg-white rounded-b-lg">
            {finance.fillRates && finance.fillRates.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={finance.fillRates} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9CA3AF" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Tỷ lệ lấp đầy"]} />
                  <Bar dataKey="rate" radius={[3, 3, 0, 0]} label={{ position: "top", fontSize: 9, fill: "#6B7280" }}>
                    {finance.fillRates.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.rate >= 100 ? "#DC2626" : entry.rate > 80 ? "#F59E0B" : "#2563EB"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-sm text-gray-400 bg-white">Không có dữ liệu tỷ lệ lấp đầy.</div>
            )}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500 bg-white">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" />Bình thường</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />Gần đầy (&gt;80%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block" />Đã đầy (100%)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── VNPAY Simulator Portal ───────────────────────────────────────────────────

function VNPAYSimulator({ invoiceId, amount, onComplete }: { invoiceId: string; amount: number; onComplete: (status: "success" | "cancel") => void }) {
  const [loading, setLoading] = useState(false);
  const [bank, setBank] = useState("NCB");
  const [cardNumber, setCardNumber] = useState("9704198526317498");
  const [cardHolder, setCardHolder] = useState("NGUYEN VAN AN");

  const sendIpnAndComplete = async (status: "success" | "cancel") => {
    setLoading(true);
    const code = status === "success" ? "00" : "99";
    const txnCode = "VNP_SIM_" + Math.floor(10000000 + Math.random() * 90000000);
    try {
      // Direct call to CRMS Backend IPN API
      await fetch(`http://localhost:8080/api/payment/vnpay-ipn?invoiceId=${invoiceId}&amount=${amount}&txnCode=${txnCode}&responseCode=${code}`);
      onComplete(status);
    } catch (e) {
      console.error(e);
      // Fallback
      onComplete(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-900/10 flex items-center justify-center font-[Inter,sans-serif] px-4 py-8">
      <div className="w-full max-w-[500px] bg-white rounded-xl shadow-2xl border border-blue-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={24} />
            <span className="font-bold text-lg tracking-wider bg-transparent">VNPAY GATEWAY</span>
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">SANDBOX SIMULATOR</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between bg-blue-50"><span className="text-gray-500 font-medium bg-transparent">Đơn vị thụ hưởng:</span><span className="font-semibold text-gray-900 bg-transparent">CRMS Portal</span></div>
            <div className="flex justify-between bg-blue-50"><span className="text-gray-500 font-medium bg-transparent">Mã hóa đơn:</span><span className="font-mono font-bold text-indigo-700 bg-transparent">{invoiceId}</span></div>
            <div className="flex justify-between border-t border-blue-100 pt-2 mt-2 bg-blue-50">
              <span className="text-gray-700 font-medium text-base bg-transparent">Số tiền thanh toán:</span>
              <span className="text-xl font-black text-blue-700 bg-transparent">{amount.toLocaleString("vi-VN")} VND</span>
            </div>
          </div>

          <div className="space-y-4 bg-white">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-1 flex items-center gap-1.5 bg-white"><Building2 size={16} className="text-blue-600" /> Nhập thông tin thẻ ATM mô phỏng</h3>
            <Select label="Ngân hàng thanh toán" value={bank} onChange={setBank}
              options={[
                { value: "NCB", label: "NCB - Ngân hàng Quốc dân (Mặc định thẻ Test)" },
                { value: "Vietcombank", label: "Vietcombank" },
                { value: "Techcombank", label: "Techcombank" },
                { value: "BIDV", label: "BIDV" }
              ]} />
            <Input label="Số thẻ ATM" value={cardNumber} onChange={setCardNumber} placeholder="9704..." />
            <Input label="Tên chủ thẻ (không dấu)" value={cardHolder} onChange={setCardHolder} placeholder="NGUYEN VAN AN" />
            <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800 flex items-start gap-1.5">
              <Info size={14} className="shrink-0 mt-0.5 bg-transparent" />
              <span className="bg-transparent">Đây là cổng mô phỏng thanh toán VNPAY an toàn. Bạn có thể nhấn nút bên dưới để gửi lệnh thanh toán thành công hoặc hủy về máy chủ Spring Boot.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 bg-white">
            <button
              onClick={() => sendIpnAndComplete("cancel")}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg text-sm transition-colors border border-gray-200 cursor-pointer"
            >
              Hủy giao dịch
            </button>
            <button
              onClick={() => sendIpnAndComplete("success")}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? <RefreshCw size={14} className="animate-spin text-white" /> : <CheckCircle size={15} className="text-white" />}
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App Component ───────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState("dashboard");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // States to catch VNPAY redirect simulator
  const [vnpayMode, setVnpayMode] = useState(false);
  const [vnpayInvoice, setVnpayInvoice] = useState("");
  const [vnpayAmount, setVnpayAmount] = useState(0);

  const addToast = (t: Omit<Toast, "id">) => {
    const id = String(++toastId.current);
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(x => x.id !== id));

  const handleLogin = (u: User) => {
    setUser(u);
    setPage(u.role === "student" ? "student-dashboard" : u.role === "lecturer" ? "lecturer-dashboard" : "registrar-dashboard");
    addToast({ type: "success", message: `Chào mừng, ${u.name}!` });
  };

  const handleLogout = () => {
    setUser(null);
    setPage("dashboard");
    addToast({ type: "info", message: "Đã đăng xuất thành công." });
  };

  useEffect(() => {
    document.body.style.fontFamily = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";

    // 1. Detect VNPAY Simulator Query Parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get("vnpaySimulate") === "true") {
      setVnpayMode(true);
      setVnpayInvoice(params.get("invoiceId") || "");
      setVnpayAmount(Number(params.get("amount")) || 0);
    }

    // 2. Detect payment result callback from simulator
    const paymentResult = params.get("paymentResult");
    if (paymentResult) {
      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      if (paymentResult === "success") {
        // Auto load dummy student user to mock login state for demo ease if user is null
        const savedUser = { id: "22110001", name: "Nguyễn Văn An", role: "student" as Role, department: "CNTT", className: "CNTT-K24A" };
        setUser(savedUser);
        setPage("tuition");
        addToast({ type: "success", message: "Thanh toán học phí thành công qua VNPAY!" });
      } else {
        const savedUser = { id: "22110001", name: "Nguyễn Văn An", role: "student" as Role, department: "CNTT", className: "CNTT-K24A" };
        setUser(savedUser);
        setPage("tuition");
        addToast({ type: "warning", message: "Giao dịch thanh toán đã bị hủy." });
      }
    }
  }, []);

  const handleVnpayComplete = (status: "success" | "cancel") => {
    setVnpayMode(false);
    // Redirect to clear simulator params and show result
    window.location.href = `${window.location.origin}/?paymentResult=${status}`;
  };

  if (vnpayMode) {
    return <VNPAYSimulator invoiceId={vnpayInvoice} amount={vnpayAmount} onComplete={handleVnpayComplete} />;
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  const renderPage = () => {
    if (user.role === "student") {
      switch (page) {
        case "student-dashboard": return <StudentDashboard user={user} />;
        case "course-registration": return <CourseRegistration user={user} addToast={addToast} />;
        case "course-search": return <CourseSearch />;
        case "timetable": return <Timetable user={user} />;
        case "tuition": return <Tuition user={user} addToast={addToast} />;
        case "personal-info": return <PersonalInfo user={user} />;
        default: return <StudentDashboard user={user} />;
      }
    }
    if (user.role === "lecturer") {
      switch (page) {
        case "lecturer-dashboard": return <LecturerDashboard user={user} />;
        case "teaching-schedule": return <TeachingSchedule user={user} />;
        case "class-management": return <ClassManagement user={user} addToast={addToast} />;
        default: return <LecturerDashboard user={user} />;
      }
    }
    if (user.role === "registrar") {
      switch (page) {
        case "registrar-dashboard": return <RegistrarDashboard />;
        case "course-catalog": return <CourseCatalog addToast={addToast} />;
        case "class-offering": return <ClassOffering addToast={addToast} />;
        case "registration-config": return <RegistrationConfig addToast={addToast} />;
        case "reports": return <Reports addToast={addToast} />;
        default: return <RegistrarDashboard />;
      }
    }
  };

  return (
    <>
      <AppLayout user={user} currentPage={page} onNavigate={setPage} onLogout={handleLogout}>
        {renderPage()}
      </AppLayout>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
