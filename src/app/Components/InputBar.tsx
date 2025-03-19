import FileUploader from "./FileUploader";
import OptionsButton from "./OptionsButton";
interface constraints {
    predefinedPrompts: { [key: string]: string };
    selectedOption: string;
    setSelectedOption: (option: string) => void;
    customPrompt: string;
    setCustomPrompt: (prompt: string) => void;
    loading: boolean;
    handleButtonClick: () => void;
    onFilesSelected: (files: FileList) => void;
  }
export default function InputBar({predefinedPrompts,selectedOption,setSelectedOption,setCustomPrompt,customPrompt,loading,handleButtonClick,onFilesSelected}: constraints){
    return(
        <div className="flex w-[1000px] p-5 h-[100px] bg-[rgba(0,0,0,0.49)] fixed bottom-5 rounded-2xl backdrop-blur-2xl justify-between items-center border border-[rgb(46,46,46)]">
            <FileUploader onFilesSelected={onFilesSelected}/>
            <OptionsButton
                predefinedPrompts={predefinedPrompts}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                customPrompt={customPrompt}
                setCustomPrompt={setCustomPrompt}
                loading={loading}
                handleButtonClick={handleButtonClick}
        />
        </div>
    );
}