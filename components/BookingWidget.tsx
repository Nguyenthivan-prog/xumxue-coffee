"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ROOM_LIST,
  ROOMS,
  formatHour,
  formatVND,
  type RoomId,
} from "@/lib/config";
import type { BookingResponse, SlotsResponse } from "@/lib/types";

type Step = "room" | "date" | "slots" | "form" | "done";

function todayVN(): string {
  const now = new Date();
  return new Date(now.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
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

function nextDays(count: number): string[] {
  const today = todayVN();
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

export function BookingWidget() {
  const [step, setStep] = useState<Step>("room");
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [date, setDate] = useState<string>(todayVN());
  const [selected, setSelected] = useState<number[]>([]);
  const [slots, setSlots] = useState<SlotsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResponse | null>(null);

  const room = roomId ? ROOMS[roomId] : null;
  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    if (!roomId || step !== "slots") return;
    setLoading(true);
    setSelected([]);
    fetch(`/api/slots?roomId=${roomId}&date=${date}`)
      .then((r) => r.json())
      .then((data: SlotsResponse) => setSlots(data))
      .finally(() => setLoading(false));
  }, [roomId, date, step]);

  const total = room ? selected.length * room.pricePerHour : 0;

  function toggleHour(hour: number) {
    setSelected((cur) => {
      if (cur.includes(hour)) return cur.filter((h) => h !== hour);
      const next = [...cur, hour].sort((a, b) => a - b);
      for (let i = 1; i < next.length; i++) {
        if (next[i] !== next[i - 1] + 1) return [hour];
      }
      return next;
    });
  }

  async function submit() {
    if (!roomId || selected.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          date,
          hours: selected,
          ...form,
        }),
      });
      const data = (await res.json()) as BookingResponse;
      setResult(data);
      if (data.ok) {
        setStep("done");
      } else if (res.status === 409) {
        // Khung giờ vừa bị người khác đặt — quay về step slots và refetch
        setStep("slots");
        setSelected([]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("room");
    setRoomId(null);
    setSelected([]);
    setSlots(null);
    setForm({ customerName: "", customerPhone: "", customerEmail: "", note: "" });
    setResult(null);
  }

  return (
    <section id="dat-phong" className="bg-walnut/95 text-cream">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-10">
          <p className="text-sand tracking-[0.3em] text-xs uppercase mb-3">
            Đặt phòng
          </p>
          <h2 className="text-cream text-3xl md:text-4xl font-semibold">
            Chọn phòng & khung giờ
          </h2>
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
              onNext={() => setStep("slots")}
              roomName={room.name}
            />
          )}

          {step === "slots" && room && (
            <StepSlots
              loading={loading}
              slots={slots?.slots ?? []}
              selected={selected}
              toggleHour={toggleHour}
              roomName={room.name}
              date={date}
              total={total}
              pricePerHour={room.pricePerHour}
              conflictMessage={result && !result.ok ? result.message : null}
              onClearConflict={() => setResult(null)}
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
              hours={selected}
              onBack={() => setStep("slots")}
              onSubmit={submit}
              error={result && !result.ok ? result.message : null}
            />
          )}

          {step === "done" && room && (
            <StepDone
              roomName={room.name}
              date={date}
              hours={selected}
              total={total}
              note={result?.message}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "room", label: "Phòng" },
    { id: "date", label: "Ngày" },
    { id: "slots", label: "Giờ" },
    { id: "form", label: "Thông tin" },
    { id: "done", label: "Xác nhận" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-center gap-2 mb-8 text-sm">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2 flex-1">
          <span
            className={`shrink-0 w-7 h-7 rounded-full grid place-items-center font-medium ${
              i <= currentIdx
                ? "bg-chocolate text-cream"
                : "bg-sand/60 text-walnut/70"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`hidden sm:inline ${
              i <= currentIdx ? "text-chocolate" : "text-walnut/60"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="flex-1 h-px bg-ochre/30 mx-1" />
          )}
        </li>
      ))}
    </ol>
  );
}

function StepRoom({ onPick }: { onPick: (id: RoomId) => void }) {
  return (
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
          <p className="text-walnut text-sm mb-3 line-clamp-2">
            {room.description}
          </p>
          <p className="text-caramel font-semibold">
            {formatVND(room.pricePerHour)}/giờ
          </p>
        </button>
      ))}
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
          const dayNum = new Date(d + "T00:00:00Z").getUTCDate();
          const monthNum = new Date(d + "T00:00:00Z").getUTCMonth() + 1;
          const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][
            new Date(d + "T00:00:00Z").getUTCDay()
          ];
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
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30">
          ← Quay lại
        </button>
        <button onClick={onNext} className="px-6 py-2.5 rounded-full bg-chocolate text-cream font-medium hover:bg-walnut">
          Xem khung giờ →
        </button>
      </div>
    </div>
  );
}

function StepSlots({
  loading,
  slots,
  selected,
  toggleHour,
  roomName,
  date,
  total,
  pricePerHour,
  conflictMessage,
  onClearConflict,
  onBack,
  onNext,
}: {
  loading: boolean;
  slots: { hour: number; available: boolean }[];
  selected: number[];
  toggleHour: (h: number) => void;
  roomName: string;
  date: string;
  total: number;
  pricePerHour: number;
  conflictMessage?: string | null;
  onClearConflict?: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      {conflictMessage && (
        <div className="mb-4 flex items-start justify-between gap-3 p-3 rounded-lg bg-caramel/15 border border-caramel/40 text-chocolate text-sm">
          <span>⚠️ {conflictMessage}</span>
          {onClearConflict && (
            <button
              onClick={onClearConflict}
              className="shrink-0 text-walnut/60 hover:text-chocolate text-lg leading-none"
              aria-label="Đóng"
            >
              ×
            </button>
          )}
        </div>
      )}
      <p className="text-walnut mb-1">
        <span className="text-chocolate font-medium">{roomName}</span> · {formatDateVN(date)}
      </p>
      <p className="text-walnut/70 text-sm mb-4">
        Chọn 1 hoặc nhiều khung 1 giờ liên tiếp. {formatVND(pricePerHour)}/giờ.
      </p>
      {loading ? (
        <div className="py-10 text-center text-walnut/60">Đang tải lịch trống...</div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
          {slots.map((slot) => {
            const active = selected.includes(slot.hour);
            return (
              <button
                key={slot.hour}
                disabled={!slot.available}
                onClick={() => toggleHour(slot.hour)}
                className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                  active
                    ? "border-caramel bg-caramel text-cream"
                    : slot.available
                    ? "border-ochre/30 text-chocolate hover:border-caramel"
                    : "border-walnut/10 bg-walnut/5 text-walnut/30 line-through cursor-not-allowed"
                }`}
              >
                {formatHour(slot.hour)}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30">
          ← Đổi ngày
        </button>
        <div className="text-center sm:text-right">
          <p className="text-walnut/70 text-xs">Tổng tạm tính</p>
          <p className="text-chocolate text-xl font-semibold">{formatVND(total)}</p>
        </div>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
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
  hours,
  onBack,
  onSubmit,
  error,
}: {
  form: { customerName: string; customerPhone: string; customerEmail: string; note: string };
  setForm: (f: typeof form) => void;
  submitting: boolean;
  total: number;
  roomName: string;
  date: string;
  hours: number[];
  onBack: () => void;
  onSubmit: () => void;
  error?: string | null;
}) {
  const start = formatHour(hours[0]);
  const end = formatHour(hours[hours.length - 1] + 1);
  const canSubmit = form.customerName.trim() && form.customerPhone.trim() && !submitting;

  return (
    <div>
      <div className="bg-sand/30 rounded-lg p-4 mb-5 text-sm">
        <p className="text-walnut/70 uppercase tracking-wider text-xs mb-1">Tóm tắt</p>
        <p className="text-chocolate">
          <strong>{roomName}</strong> · {formatDateVN(date)} · {start} – {end} ({hours.length} giờ)
        </p>
        <p className="text-chocolate text-lg font-semibold mt-1">
          {formatVND(total)}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Field label="Họ và tên *" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
        <Field label="Số điện thoại *" value={form.customerPhone} onChange={(v) => setForm({ ...form, customerPhone: v })} type="tel" />
        <Field label="Email (để nhận xác nhận đặt phòng)" value={form.customerEmail} onChange={(v) => setForm({ ...form, customerEmail: v })} type="email" className="sm:col-span-2" />
        <Field label="Ghi chú (tuỳ chọn)" value={form.note} onChange={(v) => setForm({ ...form, note: v })} className="sm:col-span-2" textarea />
      </div>
      {error && (
        <p className="text-red-700 text-sm mb-4 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}
      <div className="flex justify-between gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30">
          ← Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="px-7 py-2.5 rounded-full bg-chocolate text-cream font-medium hover:bg-walnut disabled:opacity-40"
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
  hours,
  total,
  note,
  onReset,
}: {
  roomName: string;
  date: string;
  hours: number[];
  total: number;
  note?: string;
  onReset: () => void;
}) {
  const start = formatHour(hours[0]);
  const end = formatHour(hours[hours.length - 1] + 1);
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-caramel grid place-items-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#faf3e3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="text-chocolate text-2xl font-semibold mb-2">Đã ghi nhận đặt phòng</h3>
      <p className="text-walnut mb-1">
        <strong>{roomName}</strong> · {formatDateVN(date)}
      </p>
      <p className="text-walnut mb-1">
        {start} – {end} ({hours.length} giờ)
      </p>
      <p className="text-chocolate text-lg font-semibold mt-3">{formatVND(total)}</p>
      {note && <p className="text-walnut/70 text-sm mt-4 italic">{note}</p>}
      <p className="text-walnut/70 text-sm mt-6">
        Quán sẽ liên hệ với bạn để xác nhận thanh toán và chi tiết.
      </p>
      <button onClick={onReset} className="mt-6 px-5 py-2 rounded-full border border-walnut/30 text-walnut hover:bg-sand/30">
        Đặt thêm phòng khác
      </button>
    </div>
  );
}
