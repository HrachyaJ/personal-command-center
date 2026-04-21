export function AppPreview() {
  const tasks = [
    "Design system audit",
    "Write Q2 OKRs",
    "Review PRs",
    "Team sync",
  ];
  const habits = [
    { name: "Morning run", done: true, streak: 14 },
    { name: "Read 30 min", done: true, streak: 7 },
    { name: "Meditate", done: false, streak: 3 },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(37,99,235,0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow:
          "0 32px 80px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "#f8faff",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#ff5f57",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#febc2e",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#28c840",
          }}
        />
        <span
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            color: "rgba(0,0,0,0.3)",
          }}
        >
          FocusFlow
        </span>
      </div>

      <div style={{ display: "flex", height: "340px" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "120px",
            borderRight: "1px solid rgba(0,0,0,0.06)",
            padding: "16px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            background: "#f8faff",
          }}
        >
          {["Dashboard", "Tasks", "Habits", "Goals"].map((item, i) => (
            <div
              key={item}
              style={{
                padding: "7px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                color: i === 0 ? "#fff" : "rgba(0,0,0,0.45)",
                background: i === 0 ? "#2563eb" : "transparent",
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "16px", background: "#fff" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "12px",
            }}
          >
            Today's Tasks
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginBottom: "16px",
            }}
          >
            {tasks.map((task, i) => (
              <div
                key={task}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: i < 2 ? "none" : "1.5px solid rgba(0,0,0,0.2)",
                    background: i < 2 ? "#16a34a" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i < 2 && (
                    <span style={{ color: "#fff", fontSize: "8px" }}>✓</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: i < 2 ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.75)",
                    textDecoration: i < 2 ? "line-through" : "none",
                  }}
                >
                  {task}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "10px",
            }}
          >
            Habits
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {habits.map((h) => (
              <div
                key={h.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: h.done ? "none" : "1.5px solid rgba(0,0,0,0.2)",
                      background: h.done ? "#2563eb" : "transparent",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: h.done ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.75)",
                      textDecoration: h.done ? "line-through" : "none",
                    }}
                  >
                    {h.name}
                  </span>
                </div>
                <span style={{ fontSize: "10px", color: "#ea580c" }}>
                  🔥 {h.streak}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}
            >
              <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.4)" }}>
                Daily progress
              </span>
              <span
                style={{ fontSize: "10px", color: "#2563eb", fontWeight: 600 }}
              >
                67%
              </span>
            </div>
            <div
              style={{
                height: "4px",
                background: "rgba(37,99,235,0.1)",
                borderRadius: "2px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "67%",
                  background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                  borderRadius: "2px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
