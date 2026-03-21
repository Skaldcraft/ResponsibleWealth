export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className="disclaimer" role="note">
      {compact
        ? "Data may be delayed and is provided for informational purposes only. This platform offers research, not personalized investment advice."
        : "Responsible Wealth is a public research platform. Market data may be delayed, incomplete, or subject to third-party errors. The content here is educational and informational only and should not be understood as personalized investment advice or a recommendation to buy, sell, or hold any security."}
    </div>
  );
}
