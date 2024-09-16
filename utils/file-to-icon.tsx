// imports
import {
  BsFillImageFill,
  BsFileEarmarkTextFill,
  BsFillCameraVideoFill,
} from 'react-icons/bs';
import { AiFillFile  } from 'react-icons/ai';
import { DiRuby, DiJava, DiPython, DiJavascript1    } from "react-icons/di";
import { IoLogoJavascript } from "react-icons/io5";
import { PiSpeakerSimpleHighFill } from 'react-icons/pi';
import { TbBrandCpp } from "react-icons/tb";

export default function fileToIcon(file_type: any, file_name: string): any {
  if (file_type.includes('video')) return <BsFillCameraVideoFill />;
  if (file_type.includes('audio')) return <PiSpeakerSimpleHighFill />;
  if (file_type.includes('py') || file_name.endsWith('.py')) return <DiPython />;
  if (file_type.includes('cpp') || file_type.includes('cc') || file_name.endsWith('.cpp') || file_name.endsWith('.cc')) return <TbBrandCpp />;
  if (file_type.includes('ruby') || file_name.endsWith('.rb')) return <DiRuby />;
  if (file_type.includes('javascript') || file_name.endsWith('.js')) return <IoLogoJavascript />; 
  if (file_type.includes('java') || file_name.endsWith('.java')) return <DiJava />;
  if (file_type.includes('text')) return <BsFileEarmarkTextFill />;
  if (file_type.includes('image')) return <BsFillImageFill />;
  return <AiFillFile />;
}