import React, { useState } from "react";

interface OptionsButtonProps {
  predefinedPrompts: { [key: string]: string };
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  loading: boolean;
  handleButtonClick: () => void;
}

const OptionsButton: React.FC<OptionsButtonProps> = ({
  predefinedPrompts,
  selectedOption,
  setSelectedOption,
  customPrompt,
  setCustomPrompt,
  loading,
  handleButtonClick,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
    setMenuOpen(false); // Close the dropdown menu when an option is selected
  };

  return (
    <div className="flex items-center relative text-left gap-5">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center w-[180px] h-11 rounded-lg border border-[rgb(43,43,43)] shadow-sm px-4 py-2 bg-black text-sm font-medium text-white focus:outline-none"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)} // Toggle dropdown visibility
        >
          {selectedOption}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          className="origin-top-right absolute right-0 mb-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {Object.keys(predefinedPrompts).map((option) => (
              <button
                key={option}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                role="menuitem"
                onClick={() => handleOptionChange(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
              onClick={() => handleOptionChange("Custom Prompt")}
            >
              Custom Prompt
            </button>
          </div>
        </div>
      )}

      {/*{selectedOption === "Custom Prompt" && (
        <input
          type="text"
          placeholder="Custom prompt..."
          className="w-full p-2 mt-4 border rounded"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />
      )}*/}

      <button
        onClick={handleButtonClick}
        className=" bg-black border border-[rgb(43,43,43)] text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        {loading ? "Processing..." : `Generate`}
      </button>
    </div>
  );
};

export default OptionsButton;