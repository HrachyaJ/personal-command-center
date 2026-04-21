import { useInView } from "../../../../hooks/dashboard";
import type { Feature } from "../../../../types/dashboard";

export function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
        background: "#ffffff",
        border: "1px solid rgba(37,99,235,0.1)",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: `${feature.color}12`,
          border: `1px solid ${feature.color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          color: feature.color,
          marginBottom: "16px",
          fontWeight: 700,
        }}
      >
        {feature.icon}
      </div>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#0f172a",
          marginBottom: "8px",
        }}
      >
        {feature.title}
      </h3>
      <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
        {feature.description}
      </p>
    </div>
  );
}
