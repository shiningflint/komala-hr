"use client";

import { useEffect, useState } from "react";

interface OfficeInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

interface AttendanceRecord {
  clockInAt: string | null;
  clockInDistanceM: number | null;
  clockInInsideGeofence: boolean | null;
  clockOutAt: string | null;
  clockOutDistanceM: number | null;
  clockOutInsideGeofence: boolean | null;
  status: string;
}

export function ClockCard({ office }: { office: OfficeInfo | null }) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function refresh() {
    const res = await fetch("/api/attendance/today");
    if (res.ok) {
      const data = await res.json();
      setRecord(data.record);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function getLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });
  }

  async function handleClock(kind: "clock-in" | "clock-out") {
    setLoading(true);
    setError(null);
    try {
      const pos = await getLocation();
      const res = await fetch(`/api/attendance/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to record attendance");
        return;
      }
      setRecord(data.record);
      setNote("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!office) {
    return (
      <div className="card">
        <p className="text-sm text-slate-500">
          You have no assigned office yet — ask HR to assign one before you can clock in.
        </p>
      </div>
    );
  }

  const canClockIn = !record?.clockInAt;
  const canClockOut = Boolean(record?.clockInAt) && !record?.clockOutAt;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-slate-900">Attendance — {office.name}</h2>
        {record?.status && <span className="badge-slate">{record.status}</span>}
      </div>

      <p className="text-xs text-slate-500">
        Geofence radius: {office.radiusMeters}m from office. Your location is captured via browser GPS
        when you clock in/out.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AttendanceStat
          label="Clock in"
          at={record?.clockInAt}
          distanceM={record?.clockInDistanceM}
          inside={record?.clockInInsideGeofence}
        />
        <AttendanceStat
          label="Clock out"
          at={record?.clockOutAt}
          distanceM={record?.clockOutDistanceM}
          inside={record?.clockOutInsideGeofence}
        />
      </div>

      <input
        className="input"
        placeholder="Optional note (e.g. client site visit, WFH)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          className="btn-primary"
          disabled={loading || !canClockIn}
          onClick={() => handleClock("clock-in")}
        >
          {loading ? "Getting location…" : "Clock In"}
        </button>
        <button
          className="btn-secondary"
          disabled={loading || !canClockOut}
          onClick={() => handleClock("clock-out")}
        >
          Clock Out
        </button>
      </div>
    </div>
  );
}

function AttendanceStat({
  label,
  at,
  distanceM,
  inside,
}: {
  label: string;
  at?: string | null;
  distanceM?: number | null;
  inside?: boolean | null;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      {at ? (
        <>
          <p className="mt-1 text-sm text-slate-800">{new Date(at).toLocaleTimeString()}</p>
          {distanceM != null && (
            <p className="mt-1 text-xs">
              {Math.round(distanceM)}m from office —{" "}
              <span className={inside ? "text-green-600" : "text-amber-600"}>
                {inside ? "inside geofence" : "outside geofence"}
              </span>
            </p>
          )}
        </>
      ) : (
        <p className="mt-1 text-sm text-slate-400">Not yet</p>
      )}
    </div>
  );
}
