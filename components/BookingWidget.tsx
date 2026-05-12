"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BOOKING_ENDPOINT,
  CLOSING_HOUR,
  OPENING_HOUR,
  ROOMS,
  ROOM_LIST,
  formatHour,
  formatVND,
  type RoomId,
} from "@/lib/config";

type Step = "room" | "date" | "time" | "form" | "done" | "error";

function todayVN(): string {
  const now = new Date();
  const offsetMs = (now.getTimezoneOffset() + 420) * 60 * 1000;
  const vnNow = new Date(now.getTime() + offsetMs);
  return vnNow.toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateVN(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return `${dayNames[d.getUTCDay()]}, ${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
}

const STEPS: { id: Step; label: string }[] = [
  { id: "room", label: "Phòng" },
  { id: "date", label: "Ngày" },
  { id: "time", label: "Giờ" },
  { id: "form", label: "Thông tin" },
  { id: "done", label: "Xác nhận" },
];

export function BookingWidget() {
  const [step, setStep] = useState<Step>("room");
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [date, setDate] = useState<string>(todayVN());
  const [startHour, setStartHour] = useState<number>(OPENING_HOUR);
  const [endHour, setEndHour] = useState<number>(OPENING_HOUR + 1);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [busyHours, setBusyHours] = useState<Set<number>>(new Set());
  const [loadingBusy, setLoadingBusy] = useState(false);

  const room = roomId ? ROOMS[roomId] : null;
  const days = useMemo(() => {
    const today = todayVN();
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  useEffect(() => {
    if (step !== "time" || !roomId || !BOOKING_ENDPOINT) {
      return;
    }
    let cancelled = false;
    setLoadingBusy(true);
    const url = `${BOOKING_ENDPOINT}?page=busy&room=${roomId}&date=${date}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list: number[] = Array.isArray(d?.busy) ? d.busy : [];
        setBusyHours(new Set(list));
      })
      .catch(() => {
        if (!cancelled) setBusyHours(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoadingBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, roomId, date]);

  const rangeHasBusy = useMemo(() => {
    for (let h = startHour; h < endHour; h++) {
      if (busyHours.has(h)) return true;
    }
    return false;
  }, [startHour, endHour, busyHours]);

  const hours = endHour > startHour ? endHour - startHour : 0;
  const total = room ? hours * room.pricePerHour : 0;
  const validTime =
    hours >= 1 &&
    startHour >= OPENING_HOUR &&
    endHour <= CLOSING_HOUR &&
    endHour > startHour &&
    !rangeHasBusy;
  const validForm = form.customerName.trim() !== "" && form.customerPhone.trim() !== "";

  async function submit() {
    if (!roomId || !room || !validTime || !validForm) return;

    if (!BOOKING_ENDPOINT) {
      setResult({
        ok: false,
        message:
          "Hệ thống đặt phòng đang được cấu hình. Vui lòng liên hệ quán qua hotline 0966 967 016 để đặt phòng trực tiếp.",
      });
      setStep("error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          roomId,
          date,
          startHour,
          endHour,
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim(),
          customerEmail: form.customerEmail.trim(),
          note: form.note.trim(),
        }),
      });
      const data = await res.json();
      setResult(data);
      setStep(data.ok ? "done" : "error");
    } catch (e) {
      setResult({
        ok: false,
        message:
          "Không kết nối được tới hệ thống đặt phòng. Vui lòng kiểm tra mạng và thử lại, hoặc gọi quán 0966 967 016.",
      });
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("room");
    setRoomId(null);
    setStartHour(OPENING_HOUR);
    setEndHour(OPENING_HOUR + 1);
    setForm({ customerName: "", customerPhone: "", customerEmail: "", note: "" });
    setResult(null);
  }

  return (
    <section id="dat-phong" className="bg-walnut/95 text-cream">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-10">
          <p className="text-sand tracking-[0.3em] text-xs uppercase mb-3">Đặt phòng</p>
          <h2 className="text-cream text-3xl md:text-4xl font-semibold">Chọn phòng & khung giờ</h2>
        </header>

        <div className="bg-cream text-chocolate rounded-2xl p-6 md:p-8 shadow-xl">
          <Stepper step={step} />

          {step === "room" && (
            <StepRoom
              onPick={(id) => {
                setRoomId(id);
                setStep("date");
              }}
            />
          )}

          {step === "date" && room && (
            <StepDate
              days={days}
              date={date}
              setDate={setDate}
              onBack={() => setStep("room")}
              onNext={() => setStep("time")}
              roomName={room.name}
            />
          )}

          {step === "time" && room && (
            <StepTime
              startHour={startHour}
              endHour={endHour}
              setStartHour={setStartHour}
              setEndHour={setEndHour}
              roomName={room.name}
              date={date}
              hours={hours}
              total={total}
              pricePerHour={room.pricePerHour}
              validTime={validTime}
              busyHours={busyHours}
              loadingBusy={loadingBusy}
              rangeHasBusy={rangeHasBusy}
              onBack={() => setStep("date")}
              onNext={() => setStep("form")}
            />
          )}

          {step === "form" && room && (
            <StepForm
              form={form}
              setForm={setForm}
              submitting={submitting}
              total={total}
              roomName={room.name}
              date={date}
              startHour={startHour}
              endHour={endHour}
              hours={hours}
              validForm={validForm}
              onBack={() => setStep("time")}
              onSubmit={submit}
            />
          )}

          {step === "done" && room && (
            <StepDone
              roomName={room.name}
              date={date}
              startHour={startHour}
              endHour={endHour}
              hours={hours}
              total={total}
              message={result?.message}
              onReset={reset}
            />
          )}

          {step === "error" && (
            <StepError
              message={result?.message ?? "Có lỗi xảy ra."}
              onBack={() => setStep("time")}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Stepper({ step }: { step: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === step);
  const errorMode = step === "error";
  return (
    <ol className="flex items-center gap-2 mb-8 text-sm">
      {STEPS.map((s, i) => {
        const passed = !errorMode && i <= currentIdx;
        return (
          <li key={s.id} className="flex items-center gap-2 flex-1">
            <span
              className={`shrink-0 w-7 h-7 rounded-full grid place-items-center font-medium ${
                passed ? "bg-chocolate text-cream" : "bg-sand/60 text-walnut/70"
              }`}
            >
              {i + 1}
            </span>
            <span className={`hidden sm:inline ${passed ? "text-chocolate" : "text-walnut/60"}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="flex-1 h-px bg-ochre/30 mx-1" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepRoom({ onPick }: { onPick: (id: RoomId) => void }) {
  return (
    <div>
      <p className="text-walnut mb-4">Chọn phòng bạn muốn đặt:</p>
      <div className="grid md:grid-cols-2 gap-4">
        {ROOM_LIST.map((room) => (
          <button
            key={room.id}
            onClick={() => onPick(room.id)}
            className="text-left p-5 rounded-xl border-2 border-ochre/30 hover:border-caramel hover:bg-sand/30 transition-all"
          >
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-lg font-semibold text-chocolate">{room.name}</h3>
              <span className="text-walnut/70 text-sm">{room.capacity}</span>
            </div>
            <p className="text-walnut text-sm mb-3 line-clamp-2">{room.description}</p>
            <p className="text-caramel font-semibold">{formatVND(room.pricePerHour)}/giờ</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDate({
  days,
  date,
  setDate,
  onBack,
  onNext,
  roomName,
}: {
  days: string[];
  date: string;
  setDate: (d: string) => void;
  onBack: () => void;
  onNext: () => void;
  roomName: string;
}) {
  return (
    <div>
      <p className="text-walnut mb-4">
        Chọn ngày đặt <span className="text-chocolate font-medium">{roomName}</span>
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-6">
        {days.map((d) => {
          const dt = new Date(d + "T00:00:00Z");
          const dayNum = dt.getUTCDate();
          const monthNum = dt.getUTCMonth() + 1;
          const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dt.getUTCDay()];
          const active = d === date;
          return (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                active
                  ? "border-caramel bg-caramel text-cream"
                  : "border-ochre/30 hover:border-caramel"
              }`}
            >
              <div className="text-xs">{dayName}</div>
              <div className="text-lg font-semibold">{dayNum}</div>
              <div className="text-xs opacity-70">th{monthNum}</div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30"
        >
          ← Quay lại
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-full bg-chocolate text-cream font-medium hover:bg-walnut"
        >
          Chọn khung giờ →
        </button>
      </div>
    </div>
  );
}

function StepTime({
  startHour,
  endHour,
  setStartHour,
  setEndHour,
  roomName,
  date,
  hours,
  total,
  pricePerHour,
  validTime,
  busyHours,
  loadingBusy,
  rangeHasBusy,
  onBack,
  onNext,
}: {
  startHour: number;
  endHour: number;
  setStartHour: (h: number) => void;
  setEndHour: (h: number) => void;
  roomName: string;
  date: string;
  hours: number;
  total: number;
  pricePerHour: number;
  validTime: boolean;
  busyHours: Set<number>;
  loadingBusy: boolean;
  rangeHasBusy: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const startOptions = Array.from(
    { length: CLOSING_HOUR - OPENING_HOUR },
    (_, i) => OPENING_HOUR + i
  );
  const endOptions = Array.from(
    { length: CLOSING_HOUR - startHour },
    (_, i) => startHour + 1 + i
  );

  // end h hợp lệ nếu mọi giờ k trong [startHour, h-1] đều không bận
  function endHasConflict(h: number): boolean {
    for (let k = startHour; k < h; k++) {
      if (busyHours.has(k)) return true;
    }
    return false;
  }

  function onStartChange(h: number) {
    setStartHour(h);
    if (endHour <= h) setEndHour(h + 1);
  }

  return (
    <div>
      <p className="text-walnut mb-1">
        <span className="text-chocolate font-medium">{roomName}</span> · {formatDateVN(date)}
      </p>
      <p className="text-walnut/70 text-sm mb-4">
        Chọn giờ bắt đầu và giờ kết thúc. Giá {formatVND(pricePerHour)}/giờ. Quán mở 8h - 24h.
      </p>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-walnut/80 text-sm">Lịch trống hôm đó</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              <span className="text-walnut/70">Trống</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-red-500" />
              <span className="text-walnut/70">Bận</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-caramel" />
              <span className="text-walnut/70">Đang chọn</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {startOptions.map((h) => {
            const busy = busyHours.has(h);
            const selected = !busy && h >= startHour && h < endHour;
            const base =
              "p-2 rounded-lg text-center text-xs font-medium select-none transition";
            const cls = busy
              ? "bg-red-500 text-white cursor-not-allowed"
              : selected
              ? "bg-caramel text-cream cursor-pointer"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer";
            return (
              <button
                key={h}
                type="button"
                disabled={busy}
                onClick={() => !busy && onStartChange(h)}
                className={`${base} ${cls}`}
                aria-label={`${formatHour(h)} ${busy ? "đã có khách đặt" : "trống"}`}
              >
                <div>{formatHour(h)}</div>
                <div className="text-[10px] opacity-90 mt-0.5">{busy ? "Bận" : "Trống"}</div>
              </button>
            );
          })}
        </div>
        {loadingBusy && (
          <p className="text-walnut/60 text-xs mt-2">Đang tải lịch...</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-walnut/80">Giờ bắt đầu</span>
          <select
            value={startHour}
            onChange={(e) => onStartChange(Number(e.target.value))}
            className="px-3 py-2.5 rounded-lg border border-ochre/40 bg-cream focus:outline-none focus:border-caramel text-base"
          >
            {startOptions.map((h) => {
              const busy = busyHours.has(h);
              return (
                <option key={h} value={h} disabled={busy}>
                  {formatHour(h)}
                  {busy ? " — Bận" : ""}
                </option>
              );
            })}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-walnut/80">Giờ kết thúc</span>
          <select
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
            className="px-3 py-2.5 rounded-lg border border-ochre/40 bg-cream focus:outline-none focus:border-caramel text-base"
          >
            {endOptions.map((h) => {
              const conflict = endHasConflict(h);
              return (
                <option key={h} value={h} disabled={conflict}>
                  {h === 24 ? "24:00 (nửa đêm)" : formatHour(h)}
                  {conflict ? " — Bận" : ""}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="bg-sand/30 rounded-lg p-4 mb-4 text-sm">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-walnut/70 uppercase tracking-wider text-xs mb-1">Khung giờ</p>
            <p className="text-chocolate font-medium">
              {formatHour(startHour)} – {endHour === 24 ? "24:00" : formatHour(endHour)} ({hours} giờ)
            </p>
          </div>
          <div className="text-right">
            <p className="text-walnut/70 uppercase tracking-wider text-xs mb-1">Tổng tạm tính</p>
            <p className="text-chocolate text-xl font-semibold">{formatVND(total)}</p>
          </div>
        </div>
      </div>

      {rangeHasBusy && (
        <p className="text-red-600 text-sm mb-4">
          Khung giờ bạn chọn trùng với booking đã có. Vui lòng chọn khung khác.
        </p>
      )}

      <div className="flex justify-between gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30"
        >
          ← Đổi ngày
        </button>
        <button
          onClick={onNext}
          disabled={!validTime}
          className="px-6 py-2.5 rounded-full bg-chocolate text-cream font-medium hover:bg-walnut disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
}

function StepForm({
  form,
  setForm,
  submitting,
  total,
  roomName,
  date,
  startHour,
  endHour,
  hours,
  validForm,
  onBack,
  onSubmit,
}: {
  form: { customerName: string; customerPhone: string; customerEmail: string; note: string };
  setForm: (f: typeof form) => void;
  submitting: boolean;
  total: number;
  roomName: string;
  date: string;
  startHour: number;
  endHour: number;
  hours: number;
  validForm: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <div className="bg-sand/30 rounded-lg p-4 mb-5 text-sm">
        <p className="text-walnut/70 uppercase tracking-wider text-xs mb-1">Tóm tắt</p>
        <p className="text-chocolate">
          <strong>{roomName}</strong> · {formatDateVN(date)} · {formatHour(startHour)} –{" "}
          {endHour === 24 ? "24:00" : formatHour(endHour)} ({hours} giờ)
        </p>
        <p className="text-chocolate text-lg font-semibold mt-1">{formatVND(total)}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Field
          label="Họ và tên *"
          value={form.customerName}
          onChange={(v) => setForm({ ...form, customerName: v })}
        />
        <Field
          label="Số điện thoại *"
          value={form.customerPhone}
          onChange={(v) => setForm({ ...form, customerPhone: v })}
          type="tel"
        />
        <Field
          label="Email (để nhận xác nhận đặt phòng qua email)"
          value={form.customerEmail}
          onChange={(v) => setForm({ ...form, customerEmail: v })}
          type="email"
          className="sm:col-span-2"
        />
        <Field
          label="Ghi chú (số lượng người, yêu cầu đặc biệt...)"
          value={form.note}
          onChange={(v) => setForm({ ...form, note: v })}
          className="sm:col-span-2"
          textarea
        />
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30"
        >
          ← Đổi giờ
        </button>
        <button
          onClick={onSubmit}
          disabled={!validForm || submitting}
          className="px-7 py-2.5 rounded-full bg-chocolate text-cream font-medium hover:bg-walnut disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Đang gửi..." : "Xác nhận đặt phòng"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  textarea?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="text-walnut/80">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="px-3 py-2 rounded-lg border border-ochre/40 bg-cream focus:outline-none focus:border-caramel resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-ochre/40 bg-cream focus:outline-none focus:border-caramel"
        />
      )}
    </label>
  );
}

function StepDone({
  roomName,
  date,
  startHour,
  endHour,
  hours,
  total,
  message,
  onReset,
}: {
  roomName: string;
  date: string;
  startHour: number;
  endHour: number;
  hours: number;
  total: number;
  message?: string;
  onReset: () => void;
}) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-caramel grid place-items-center mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#faf3e3"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="text-chocolate text-2xl font-semibold mb-2">Đã ghi nhận đặt phòng</h3>
      <p className="text-walnut mb-1">
        <strong>{roomName}</strong> · {formatDateVN(date)}
      </p>
      <p className="text-walnut mb-1">
        {formatHour(startHour)} – {endHour === 24 ? "24:00" : formatHour(endHour)} ({hours} giờ)
      </p>
      <p className="text-chocolate text-lg font-semibold mt-3">{formatVND(total)}</p>
      {message && <p className="text-walnut/70 text-sm mt-4">{message}</p>}
      <p className="text-walnut/70 text-sm mt-4">
        Bạn sẽ nhận email xác nhận trong vài phút. Quán sẽ liên hệ qua SĐT để xác nhận thanh toán.
      </p>
      <button
        onClick={onReset}
        className="mt-6 px-5 py-2 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30"
      >
        Đặt thêm phòng khác
      </button>
    </div>
  );
}

function StepError({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-walnut/20 grid place-items-center mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-chocolate"
        >
          <line x1="12" y1="8" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h3 className="text-chocolate text-xl font-semibold mb-3">Không hoàn tất được đặt phòng</h3>
      <p className="text-walnut max-w-md mx-auto">{message}</p>
      <button
        onClick={onBack}
        className="mt-6 px-5 py-2.5 rounded-full bg-chocolate text-cream hover:bg-walnut"
      >
        ← Thử khung giờ khác
      </button>
    </div>
  );
}
