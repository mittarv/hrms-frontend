const LogOverviewCards = ({ overview }) => {
  const progress = overview?.progress || {};

  const formatCycleDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const cycleStartLabel = formatCycleDate(progress?.cycleStartDate);
  const cycleEndLabel = formatCycleDate(progress?.cycleEndDate);
  const cycleLabel =
    cycleStartLabel && cycleEndLabel ? `${cycleStartLabel} - ${cycleEndLabel}` : progress?.year || "-";

  const primaryLocation = overview?.primaryLocationLabel || overview?.primaryLocation || "Not set";
  const secondaryLocation = overview?.secondaryLocationLabel || overview?.secondaryLocation || "Not set";

  const usedDurationDays = Number(progress?.usedDurationDays) || 0;
  const requiredDurationDays = Number(progress?.requiredDurationDays) || 0;
  const requiredDurationWeeks = Number(progress?.requiredDurationWeeks) || 0;
  const usedSplits = Number(progress?.usedSplits) || 0;
  const maximumSplitsPerYear = Number(progress?.maximumSplitsPerYear) || 0;

  return (
    <div className="sl_log_overview_grid">
      <div className="sl_log_overview_card">
        <p className="sl_log_card_label">Your Location</p>
        <div className="sl_log_location_split">
          <div className="sl_log_location_block">
            <h4>{primaryLocation}</h4>
            <span>Primary</span>
          </div>
          <div className="sl_log_location_divider" />
          <div className="sl_log_location_block">
            <h4>{secondaryLocation}</h4>
            <span>Secondary</span>
          </div>
        </div>
      </div>

      <div className="sl_log_overview_card">
        <div className="sl_log_progress_row">
          <p className="sl_log_card_label">WFO progress</p>
          <span className="sl_log_year_label">{cycleLabel}</span>
        </div>
        <h4 className="sl_log_progress_value">
          {usedDurationDays}/{requiredDurationDays} Days
        </h4>
        <p className="sl_log_progress_hint">
          Required: {requiredDurationWeeks} weeks annually
        </p>
        {maximumSplitsPerYear > 0 && (
          <p className="sl_log_progress_hint">
            Splits used: {usedSplits}/{maximumSplitsPerYear}
          </p>
        )}
      </div>
    </div>
  );
};

export default LogOverviewCards;
