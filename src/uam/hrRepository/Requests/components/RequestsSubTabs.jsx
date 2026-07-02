const RequestsSubTabs = ({ tabs = [], activeTab, onTabChange }) => {
  if (!tabs.length) return null;

  return (
    <div className="requests_sub_tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`sub_tab ${activeTab === tab.value ? "active" : ""}`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default RequestsSubTabs;
