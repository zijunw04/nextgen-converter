"use client";

// imports
import { FaFileUpload } from "react-icons/fa";
import { MdFileDownloadDone } from "react-icons/md";
import { MdClose } from "react-icons/md";
import ReactDropzone from "react-dropzone";
import bytesToSize from "@/utils/bytes-to-size";
import fileToIcon from "@/utils/file-to-icon";
import { useState, useEffect, useRef } from "react";
import compressFileName from "@/utils/compress-file-name";
import { Skeleton } from "@/components/ui/skeleton";
import convertFile from "@/utils/convert";
import { ImSpinner3 } from "react-icons/im";
import { MdDone } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { HiOutlineDownload } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import loadFfmpeg from "@/utils/load-ffmpeg";
import type { Action } from "@/types";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useSession } from "next-auth/react";
import { ref, onValue, increment, update } from "firebase/database";
import { database } from "@/src/app/firebase";
import { createHash } from 'crypto';

const extensions = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "ico",
    "tif",
    "tiff",
    "tga",
  ],
  video: [
    "mp4",
    "m4v",
    "mp4v",
    "3gp",
    "3g2",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "flv",
    "ogv",
    "webm",
    "h264",
    "264",
    "hevc",
    "265",
  ],
  audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
};

export default function Dropzone() {
  // variables & hooks
  const { data: session } = useSession();
  const [is_hover, setIsHover] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [is_ready, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<any>>([]);
  const [is_loaded, setIsLoaded] = useState<boolean>(false);
  const [is_converting, setIsConverting] = useState<boolean>(false);
  const [is_done, setIsDone] = useState<boolean>(false);
  const ffmpegRef = useRef<any>(null);
  const [defaultValues, setDefaultValues] = useState<string>("video");
  const accepted_files = {
    "image/*": [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".ico",
      ".tif",
      ".tiff",
      ".tga",
    ],
    "audio/*": [],
    "video/*": [],
  };
  const [totalUploads, setTotalUploads] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  useEffect(() => {
    const statsRef = ref(database, "stats");

    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      setTotalUploads(data?.uploads || 0);
      setTotalSize(data?.totalSize || 0);
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  // functions
  const reset = () => {
    setIsDone(false);
    setActions([]);
    setFiles([]);
    setIsReady(false);
    setIsConverting(false);
  };
  const downloadAll = (): void => {
    for (let action of actions) {
      !action.is_error && download(action);
    }
  };
  const download = (action: Action) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url;
    a.download = action.output;

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(action.url);
    document.body.removeChild(a);
  };
  const convert = async (): Promise<void> => {
    let tmp_actions = actions.map((elt) => ({
      ...elt,
      is_converting: true,
      progress: 0,
      speed: 0,
    }));
    setActions(tmp_actions);
    setIsConverting(true);

    for (let action of tmp_actions) {
      try {
        const startTime = Date.now();
        const { url, output } = await convertFile(
          ffmpegRef.current,
          action,
          (progress) => {
            const now = Date.now();
            const elapsedTime = (now - startTime) / 1000; // in seconds
            const speed = (progress * action.file_size) / elapsedTime; // bytes per second

            setActions((prevActions) =>
              prevActions.map((a) =>
                a.file_name === action.file_name
                  ? { ...a, progress: progress * 100, speed: speed }
                  : a
              )
            );
          }
        );

        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: true,
                is_converting: false,
                url,
                output,
              }
            : elt
        );
        setActions(tmp_actions);
      } catch (err) {
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: false,
                is_converting: false,
                is_error: true,
              }
            : elt
        );
        setActions(tmp_actions);
      }
    }

    setIsDone(true);
    setIsConverting(false);
  };

  const createUserId = (email: string) => {
    return createHash('md5').update(email).digest('hex');
  };

  const handleUpload = (data: File[]): void => {
    handleExitHover();
    const maxUploads = session ? Infinity : 10;
    const filesToUpload = data.slice(0, maxUploads);
    setFiles(filesToUpload);
  
    const uploadCount = filesToUpload.length;
  const uploadSize = filesToUpload.reduce((acc, file) => acc + file.size, 0);

  if (session && session.user && session.user.email) {
    const userId = createUserId(session.user.email); // Use the method you chose
    const userRef = ref(database, `users/${userId}`);
    const updates: { [key: string]: any } = {};
    updates["/uploads"] = increment(uploadCount);
    updates["/totalSize"] = increment(uploadSize);
    updates["/name"] = session.user.name || 'Anonymous';
    update(userRef, updates);
  }
  
  
  

  const statsUpdates: { [key: string]: any } = {};
  statsUpdates["/stats/uploads"] = increment(uploadCount);
  statsUpdates["/stats/totalSize"] = increment(uploadSize);
  update(ref(database), statsUpdates).then(() => {
    setTotalUploads((prevUploads) => prevUploads + uploadCount);
    setTotalSize((prevSize) => prevSize + uploadSize);
  });
  
    const tmp: Action[] = [];
    filesToUpload.forEach((file: File) => {
      tmp.push({
        file_name: file.name,
        file_size: file.size,
        from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
        to: null,
        file_type: file.type,
        file,
        is_converted: false,
        is_converting: false,
        is_error: false,
      });
    });
    setActions(tmp);

    

    const updates: { [key: string]: any } = {};
    updates["/stats/uploads"] = increment(uploadCount);
    updates["/stats/totalSize"] = increment(uploadSize);

    update(ref(database), updates).then(() => {
      // Update local state after successful database update
      setTotalUploads((prevUploads) => prevUploads + uploadCount);
      setTotalSize((prevSize) => prevSize + uploadSize);
    });

    if (data.length > maxUploads) {
      alert(
        `As a non-logged-in user, you can only upload up to ${maxUploads} files. Please log in to upload more.`
      );
    }
  };

  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);
  const updateAction = (file_name: string, to: string) => {
    setActions((prevActions) =>
      prevActions.map((action) =>
        action.file_name === file_name ? { ...action, to } : action
      )
    );
  };

  const checkIsReady = (): void => {
    let tmp_is_ready = true;
    actions.forEach((action: Action) => {
      if (!action.to) tmp_is_ready = false;
    });
    setIsReady(tmp_is_ready);
  };
  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.file_name));
  };
  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
      setIsConverting(false);
    } else checkIsReady();
  }, [actions]);
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
    setIsLoaded(true);
  };

  // returns
  if (actions.length) {
    return (
      <div className=" w-full px-[10%] gap-5 flex flex-col">
        {actions.map((action: Action, i: number) => (
          <div
            key={action.file_name}
            className="w-full py-4 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
          >
            {!is_loaded && (
              <Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
            )}
            <div className="flex gap-4 items-center">
              <span className="text-2xl text-orange-600">
                {fileToIcon(action.file_type, "none")}
              </span>
              <div className="flex items-center gap-1 w-96">
                <span className="text-md font-medium overflow-x-hidden">
                  {compressFileName(action.file_name)}
                </span>
                <span className="text-sm">
                  ({bytesToSize(action.file_size)})
                </span>
              </div>
            </div>

            {action.is_error ? (
              <Badge variant="destructive" className="flex gap-2">
                <span>Error Converting File</span>
                <BiError />
              </Badge>
            ) : action.is_converted ? (
              <Badge variant="default" className="flex gap-2 bg-green-500">
                <span>Done</span>
                <MdDone />
              </Badge>
            ) : action.is_converting ? (
              <div className="flex items-center">
                <ImSpinner3 className="animate-spin mr-2" />
                Converting
                {action.progress !== undefined && (
                  <span className="ml-2">{action.progress.toFixed(0)}%</span>
                )}
                {action.speed !== undefined && (
                  <span className="ml-2">{bytesToSize(action.speed)}/s</span>
                )}
              </div>
            ) : (
              <div className="text-md flex items-center gap-4">
                <span>Convert to</span>
                <Select
                  onValueChange={(value: string) => {
                    if (extensions.audio.includes(value)) {
                      setDefaultValues("audio");
                    } else if (extensions.video.includes(value)) {
                      setDefaultValues("video");
                    }
                    updateAction(action.file_name, value);
                  }}
                  value={action.to || ""}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Output Format" />
                  </SelectTrigger>
                  <SelectContent className="h-fit">
                    {action.file_type.includes("image") && (
                      <div className="grid grid-cols-2 gap-2 w-fit">
                        {extensions.image.map((elt, i) => (
                          <div key={i} className="col-span-1 text-center">
                            <SelectItem value={elt} className="mx-auto">
                              {elt}
                            </SelectItem>
                          </div>
                        ))}
                      </div>
                    )}
                    {action.file_type.includes("video") && (
                      <Tabs defaultValue={defaultValues} className="w-full">
                        <TabsList className="w-full">
                          <TabsTrigger value="video" className="w-full">
                            Video
                          </TabsTrigger>
                          <TabsTrigger value="audio" className="w-full">
                            Audio
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="video">
                          <div className="grid grid-cols-3 gap-2 w-fit">
                            {extensions.video.map((elt, i) => (
                              <div key={i} className="col-span-1 text-center">
                                <SelectItem value={elt} className="mx-auto">
                                  {elt}
                                </SelectItem>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="audio">
                          <div className="grid grid-cols-3 gap-2 w-fit">
                            {extensions.audio.map((elt, i) => (
                              <div key={i} className="col-span-1 text-center">
                                <SelectItem value={elt} className="mx-auto">
                                  {elt}
                                </SelectItem>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                    {action.file_type.includes("audio") && (
                      <div className="grid grid-cols-2 gap-2 w-fit">
                        {extensions.audio.map((elt, i) => (
                          <div key={i} className="col-span-1 text-center">
                            <SelectItem value={elt} className="mx-auto">
                              {elt}
                            </SelectItem>
                          </div>
                        ))}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {action.is_converted ? (
              <a className="px-4" onClick={() => download(action)}>
                Download
              </a>
            ) : (
              <span
                onClick={() => deleteAction(action)}
                className="cursor-pointer hover:bg-foreground hover:text-background rounded-full h-10 w-10 flex items-center justify-center text-2xl text-foreground"
              >
                <MdClose />
              </span>
            )}
          </div>
        ))}
        <div className="flex w-full justify-end">
          {is_done ? (
            <div className="space-y-4 w-fit">
              <button
                className="rounded-xl font-semibold relative py-4 text-md flex gap-2 items-center w-full"
                onClick={downloadAll}
              >
                {actions.length > 1 ? "Download All" : "Download"}
                <HiOutlineDownload />
              </button>
              <a onClick={reset} className="rounded-xl">
                Convert Another File(s)
              </a>
            </div>
          ) : (
            <button
              className="rounded-xl font-semibold relative py-4 text-md flex items-center w-44 cursor-default"
              
            >
              {is_converting ? (
                <a className=" text-lg flex flex-row justify-center items-center ">
                  <ImSpinner3 className="animate-spin" />
                  <span className="ml-2">Converting...</span>
                </a>
              ) : (
                <a onClick={convert} className="border-[rgb(50_50_40)] border-[1px] py-4 px-7 rounded-3xl hover:cursor-pointer">
                  Convert Now
                </a>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ReactDropzone
      onDrop={handleUpload}
      onDragEnter={handleHover}
      onDragLeave={handleExitHover}
      accept={accepted_files}
    >
      {({ getRootProps, getInputProps }) => (
        <div className="flex flex-col justify-center items-center w-full">
          <div
            {...getRootProps()}
            className="w-[90%]  cursor-pointer h-72 rounded-xl shadow-sm border-2 border-dashed border-foreground flex items-center justify-center"
          >
            <input {...getInputProps()} />
            <div className="space-y-4 ">
              {is_hover ? (
                <>
                  <div className="flex justify-center">
                    <MdFileDownloadDone className="text-6xl" />
                  </div>
                  <h3 className="text-center font-medium text-2xl">
                    Yes, right there
                  </h3>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <FaFileUpload className="text-6xl" />
                  </div>
                  <h3 className="text-center font-medium text-2xl">
                    Click, or drop your files here
                  </h3>
                  {!session && (
                    <p className="text-center text-sm">
                      Non-logged-in users can upload up to 10 files. Log in to
                      upload more.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className=" text-center mt-8 flex flex-row">
            <p>
              We've converted {totalUploads} files with a total size of{" "}
              {bytesToSize(totalSize)}
            </p>
          </div>
        </div>
      )}
    </ReactDropzone>
  );
}
