import { useEffect, useState } from "react";
import { getAllTeams } from "../services/teamService";

export default function PublicDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAllTeams().then((t) => { setTeams(t); setLoading(false); });
  }, []);

  const counts = {
    total:       teams.length,
    approved:    teams.filter((t) => t.status === "approved").length,
    pending:     teams.filter((t) => t.status === "pending").length,
    waitlisted:  teams.filter((t) => t.status === "waitlisted").length,
    hackathon:   teams.filter((t) => t.eventType === "hackathon").length,
    designathon: teams.filter((t) => t.eventType === "designathon").length,
  };

  const visible =
    filter === "all"
      ? teams
      : filter === "hackathon" || filter === "designathon"
      ? teams.filter((t) => t.eventType === filter)
      : teams.filter((t) => t.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "sans-serif", padding: "32px 16px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: "0.8rem", color: "#F5B301", letterSpacing: 5, textTransform: "uppercase", marginBottom: 8 }}>
          NIRMAVORA FEST 2K26
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px" }}>Registration Status</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", margin: 0 }}>Live · Read-only</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
        {[
          { key: "total",       label: "Total",       val: counts.total,       color: "#a5b4fc" },
          { key: "approved",    label: "Approved",    val: counts.approved,    color: "#22c55e" },
          { key: "pending",     label: "Pending",     val: counts.pending,     color: "#F5B301" },
          { key: "waitlisted",  label: "Waitlisted",  val: counts.waitlisted,  color: "#c084fc" },
          { key: "hackathon",   label: "Hackathon",   val: counts.hackathon,   color: "#f472b6" },
          { key: "designathon", label: "Designathon", val: counts.designathon, color: "#fb923c" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key === "total" ? "all" : s.key)}
            style={{
              background: (filter === s.key || (s.key === "total" && filter === "all"))
                ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              border: (filter === s.key || (s.key === "total" && filter === "all"))
                ? `1.5px solid ${s.color}` : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "14px 20px",
              cursor: "pointer",
              textAlign: "center",
              minWidth: 100,
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 5 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Team list */}
      {loading ? (
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 40 }}>Loading…</p>
      ) : (
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.length === 0 && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: 32 }}>No teams found</p>
          )}
          {visible.map((t) => (
            <div
              key={t.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.teamName}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{t.collegeName}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{
                  background: t.eventType === "hackathon" ? "rgba(244,114,182,0.12)" : "rgba(251,146,60,0.12)",
                  color: t.eventType === "hackathon" ? "#f472b6" : "#fb923c",
                  padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", textTransform: "capitalize",
                }}>
                  {t.eventType}
                </span>
                <span style={{
                  background: statusBg(t.status),
                  color: statusText(t.status),
                  padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", textTransform: "capitalize",
                }}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: "0.7rem", marginTop: 40 }}>
        NIRMAVORA 2K26 · Data updates live
      </p>
    </div>
  );
}

function statusBg(s) {
  if (s === "approved")   return "rgba(34,197,94,0.12)";
  if (s === "pending")    return "rgba(245,179,1,0.12)";
  if (s === "waitlisted") return "rgba(192,132,252,0.12)";
  if (s === "cancelled")  return "rgba(239,68,68,0.12)";
  return "rgba(255,255,255,0.07)";
}
function statusText(s) {
  if (s === "approved")   return "#22c55e";
  if (s === "pending")    return "#F5B301";
  if (s === "waitlisted") return "#c084fc";
  if (s === "cancelled")  return "#f87171";
  return "#fff";
}
