// imports
import Dropzone from '@/components/dropzone';


export default function FileConvert() {
  return (
      <div className="flex justify-center items-center flex-col  w-full mt-16 h-full gap-8 px-[10%]">
          <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-medium text-center">NEXTGEN CONVERTER</h1>
                <h1 className='text-3xl md:text-5xl font-medium text-center text-[#eb2f2f]'>Seamless Multi-Format Conversion</h1>
              <p className=" text-md md:text-lg text-center md:px-28">
                Introducing the NextGen File Converter, a cutting-edge tool designed for effortless conversion of audio, video, and image files. With a user-friendly interface, this converter allows you to drag and drop files for quick processing, supporting a wide range of formats including MP4, MP3, JPEG, and more.
              </p>
          </div>

          <Dropzone />
      </div>
  );
}
