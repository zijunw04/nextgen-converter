'use client'
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Navbar from "@/components/navbar";
import ReactDropzone from "react-dropzone";
import { FaFileUpload } from "react-icons/fa";
import { MdClose, MdFileDownloadDone } from "react-icons/md";
import { GeminiAI } from "@/utils/gemini-ai";
import bytesToSize from "@/utils/bytes-to-size";
import fileToIcon from "@/utils/file-to-icon";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HiOutlineDownload } from "react-icons/hi";

const languages = ["JavaScript", "Python", "Java", "C++", "Ruby", "Matlab"];
const acceptedFileTypes = {
  'text/javascript': ['.js', '.jsx'],
  'text/x-python': ['.py'],
  'text/x-java': ['.java'],
  'text/x-c++src': ['.cpp', '.cc'],
  'text/x-ruby': ['.rb'],
  'text/matlab': ['.m']
  
};

interface CodeFile {
  name: string;
  size: number;
  type: string;
  fromLanguage: string;
  toLanguage: string;
  isConverting: boolean;
  isConverted: boolean;
  isError: boolean;
  url: string;
}

export default function CodeConverter() {
  const { data: session } = useSession();
  const router = useRouter();
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [isHover, setIsHover] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    if (!session){
      router.push('/signin');
      return;
    }


    const newCodeFiles = acceptedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      fromLanguage: detectLanguage(file.name),
      toLanguage: "",
      isConverting: false,
      isConverted: false,
      isError: false,
      url: URL.createObjectURL(file)
    }));
    setCodeFiles(prev => [...prev, ...newCodeFiles]);
    setIsDone(false);
  };

  const detectLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js': case 'jsx': return 'JavaScript';
      case 'py': return 'Python';
      case 'java': return 'Java';
      case 'cpp': case 'cc': return 'C++';
      case 'rb': return 'Ruby';
      case 'm': return 'Matlab';
      default: return '';
    }
  };

  const getFileExtension = (language: string): string => {
    switch (language) {
      case 'JavaScript': return '.js';
      case 'Python': return '.py';
      case 'Java': return '.java';
      case 'C++': return '.cpp';
      case 'Ruby': return '.rb';
      case 'Matlab': return '.m';
      default: return '';
    }
  };

  const handleConvert = async (index: number) => {
    const file = codeFiles[index];
    if (!file.toLanguage || !file.url) return;

    setCodeFiles(prev => prev.map((f, i) => i === index ? { ...f, isConverting: true } : f));
    setIsConverting(true);
    try {
      const fileContent = await readFileContent(file.url);
      const convertedCode = await GeminiAI.convertCode(fileContent, file.fromLanguage, file.toLanguage);
      const newExtension = getFileExtension(file.toLanguage);
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + newExtension;
      const convertedBlob = new Blob([convertedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(convertedBlob);

      setCodeFiles(prev => prev.map((f, i) => i === index ? {
        ...f,
        isConverting: false,
        isConverted: true,
        url: url,
        name: newFileName
        
      } : f));
      setIsDone(true);
      setIsConverting(false);
    } catch (error) {
      console.error("Error converting code:", error);
      setCodeFiles(prev => prev.map((f, i) => i === index ? { ...f, isConverting: false, isError: true } : f));
    }
  };

  const readFileContent = async (url: string): Promise<string> => {
    const response = await fetch(url);
    return await response.text();
  };

  const handleDelete = (index: number) => {
    setCodeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertAll = async () => {
    setIsConverting(true);
    for (let i = 0; i < codeFiles.length; i++) {
      if (!codeFiles[i].isConverted && !codeFiles[i].isError) {
        await handleConvert(i);
      }
    }
    setIsConverting(false);
    setIsDone(true);
  };

  const downloadAll = () => {
    codeFiles.forEach(file => {
      if (file.isConverted && file.url) {
        const a = document.createElement("a");
        a.href = file.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  const reset = () => {
    setCodeFiles([]);
    setIsDone(false);
  };

  return (
    <div className="w-full h-screen">
      <Navbar />
      <div className="flex justify-center items-center flex-col  w-full h-[90vh] gap-8 px-[10%]">
        <h1 className="text-3xl md:text-5xl font-medium text-center">NEXTGEN CONVERTER</h1>
                <h1 className='text-3xl md:text-5xl font-medium text-center text-[#eb2f2f]'>AI Code Converter</h1>
              <p className=" text-md md:text-lg text-center md:px-28">
                Introducing the AI Code Converter, this automatically create code from user input, boosting developer productivity and speeding up software development. They are efficient for simple tasks but require human oversight for complex projects.
              </p>
        {codeFiles.length === 0 ? (
          <ReactDropzone onDrop={handleDrop} onDragEnter={() => setIsHover(true)} onDragLeave={() => setIsHover(false)} accept={acceptedFileTypes}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="w-[90%]  cursor-pointer h-72 rounded-xl shadow-sm border-2 border-dashed border-foreground flex items-center justify-center flex-col ">
                <div className="space-y-4 justify-center flex items-center flex-col">
                <FaFileUpload className=" text-6xl" />
                <input {...getInputProps()} />
                {isHover ? (
                  <p className="text-center font-medium text-2xl">Drop your code files here</p>
                ) : (
                  <div className="flex justify-center items-center flex-col">
                    <p className="text-center font-medium text-2xl">Drag and drop your code files here, or click to select files</p>
                    <p>- Sign-in required - </p>
                  </div>
                )}
                </div>
              </div>
            )}
          </ReactDropzone>
        ) : (
          <div className="w-full px-[10%] gap-5 flex flex-col">
            {codeFiles.map((file, index) => (
              <div key={file.name} className="w-full py-4 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between">
                <div className="flex gap-4 items-center">
                  <span className="text-2xl text-orange-600">
                  {fileToIcon(file.type, file.name)}

                  </span>
                  <div className="flex items-center gap-1 w-96">
                    <span className="text-md font-medium overflow-x-hidden">
                      {file.name}
                    </span>
                    <span className="text-sm">
                      ({bytesToSize(file.size)})
                    </span>
                  </div>
                </div>

                {file.isError ? (
                  <Badge variant="destructive" className="flex gap-2">
                    <span>Error Converting File</span>
                  </Badge>
                ) : file.isConverted ? (
                  <Badge variant="default" className="flex gap-2 bg-green-500">
                    <span>Done</span>
                    <MdFileDownloadDone />
                  </Badge>
                ) : file.isConverting ? (
                  <div className="flex items-center">
                    Converting...
                  </div>
                ) : (
                  <div className="text-md flex items-center gap-4">
                    <span>Convert to</span>
                    <Select
                      onValueChange={(value) => setCodeFiles(prev => 
                        prev.map((f, i) => i === index ? { ...f, toLanguage: value } : f)
                      )}
                      value={file.toLanguage}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.filter(lang => lang !== file.fromLanguage).map(lang => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!file.isConverted && (
                  <span
                    onClick={() => handleDelete(index)}
                    className="cursor-pointer hover:bg-foreground hover:text-background rounded-full h-10 w-10 flex items-center justify-center text-2xl text-foreground"
                  >
                    <MdClose />
                  </span>
                )}
              </div>
            ))}
            <div className="flex w-full justify-end">
            {isDone ? (
                <div className="space-y-4 w-fit">
                  <button
                    className="rounded-xl font-semibold relative py-4 text-md flex gap-2 items-center w-full"
                    onClick={downloadAll}
                  >
                    {codeFiles.length > 1 ? "Download All" : "Download"}
                    <HiOutlineDownload />
                  </button>
                  <button onClick={reset} className="rounded-xl">
                    Convert Another File(s)
                  </button>
                </div>
              ) : (
                <button
                  onClick={convertAll}
                  className="border-[rgb(50_50_40)] border-[1px] py-4 px-7 rounded-3xl hover:cursor-pointer"
                  disabled={isConverting || codeFiles.every(file => file.isConverted || file.isError)}
                >
                  {isConverting ? "Converting..." : "Convert Now"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
