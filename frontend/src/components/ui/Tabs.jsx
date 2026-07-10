// frontend/src/components/ui/Tabs.jsx
export function Tabs({ tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  return (
    <div>
      <div className="flex gap-0 border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-4 py-3
              font-medium
              border-b-2
              transition-colors
              ${activeTab === index
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[activeTab].content}</div>
    </div>
  );
}